import { createAccessToken } from "../config/jwt.js";
import transporter from "../config/transporter.js";
import connect from "../models/connect.js";
import initModels from "../models/init-models.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; //lib để tạo code forgot password
import { sendMailForgotPassword } from "../utils/sendMail.js";
import users from "../models/users.js";

const models = initModels(connect);

const register = async (req, res) => {
  try {
    //1 : nhận dữ liệu: email pass_word,full_name
    const { full_name, email, pass_word } = req.body;
    console.log("dữ liệu nhận :", { full_name, email, pass_word });

    //2 : kiểm tra email đã tồn tai bên trong db chưa
    // -- nếu đã tồn tại : trả lỗi "tài khoản đã tồn tại , vui lòng đăng ký tài khoản khác"
    // -- nếu chưa tồn tại : tiếp tục bước 3
    const userExist = await models.users.findOne({
      where: {
        email: email,
      },
    });
    if (userExist) {
      res.status(400).json({
        message: "tài khoản đã tồn tại , vui lòng đăng ký tài khoản khác",
      });
      return;
    }

    //3 : mã hóa password
    const hashPassword = bcrypt.hashSync(pass_word, 10);
    //4 : thêm người dùng(CREATE) vào db
    const result = await models.users.create({
      full_name: full_name,
      email: email,
      pass_word: hashPassword,
    });
    console.log({ result: result.toJSON() });

    //5 : kiểm tra dữ liệu đổ về có password hay không => xóa password
    const userNew = result.dataValues;
    delete userNew.pass_word;

    //6 : send mail welcome to newuser
    //cấu hình format email welcome
    const welcomeMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "welcome to our Website",
      html: `
        <h1>Welcome ${full_name} our Website</h1>
      `,
    };
    //gửi mail
    //parram1: dữ liệu email=>welcomeMail
    //Param2
    //      nếu gửi mail thành công thì trả về thông báo
    //       nếu gửi mail thất bại thì trả về thông báo lỗi
    transporter.sendMail(welcomeMail, (err, info) => {
      if (err) {
        return res.status(500).json({ message: "gửi mail thất bại" });
      }
      //6 : trả dữ liệu đăng ký thành công về lại FE
      res.status(200).json(userNew);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(`Error ${error}`);
  }
};

const login = async (req, res) => {
  try {
    // 1 nhận dữ liệu : email,pass_word
    const { email, pass_word } = req.body;
    console.log("dữ liệu nhận :", { email, pass_word });

    // 2 kiểm tra email có tồn tại hay chưa
    // - nếu chưa tồn tại : trả lõi "email chưa tồn tại vui lòng đăng ký"
    // - nếu đã tồn tại : đi tiếp
    const userExits = await models.users.findOne({
      where: {
        email: email,
      },
    });
    if (!userExits) {
      res.status(400).json({ message: "email chưa tồn tại vui lòng đăng ký" });
      return;
    }
    console.log({ userExits });

    // 2.1 - (thêm) kiểm tra tk là đăng nhập FB hay GG
    if (!userExits.dataValues.pass_word) {
      res.status(400).json({
        message: "kh có mật khẩu , vui lòng đăng nhập FB để cập nhật mật khẩu",
      });
      return;
    }
    // 3 kiểm tra password có hợp lệ hay không
    const isPassword = bcrypt.compareSync(
      pass_word,
      userExits.dataValues.pass_word
    ); // true
    if (!isPassword) {
      res.status(400).json({ message: "mật khẩu không chính xác" });
      return;
    }

    // tạo access token cho user
    const payload = {
      userId: userExits.user_id,
    };

    //tạo access token
    const accessToken = createAccessToken(payload);
    // 4 trả kết quả thành công

    res.status(200).json({
      message: "đăng nhập thành thành công",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(`Error ${error}`);
  }
};

//define forgotPassword controller
const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    //kiểm tra email có tồn tại trong db hay kh
    let userExist = await models.users.findOne({
      where: {
        email,
      },
    });
    //TH1: email không tồn tại trong db
    if (!userExist) {
      return res
        .status(400)
        .json({ message: "email không tồn tại trong hệ thống" });
    }
    //TH2:email tồn tại trong db
    //tạo code forgot password ,lưu db và gửi mail cho user
    let code = crypto.randomBytes(6).toString("hex");
    let mailForgotPass = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Code xác thực",
      html: `
        <h1>${code}</h1>
      `,
    };

    //lưu vào db
    //nếu user gửi 10 request forgot pass thì chỉ lấy code mới nhất
    let codeForgotPassExists = await models.forgot_password_code.findOne({
      where: {
        user_id: userExist.user_id,
      },
    });
    if (codeForgotPassExists) {
      //update code forgot password mới nhất
      //set lại cái thời gian expired của code mới
      let expired = new Date(new Date().getTime() + 2 * 60 * 60 * 10000);
      await models.forgot_password_code.update(
        {
          forgot_code: code,
          expired: expired,
        },
        { where: { user_id: userExist.user_id } }
      );

      return sendMailForgotPassword(res, transporter, mailForgotPass);
    } else {
      let expired = new Date(new Date().getTime() + 2 * 60 * 60 * 10000);
      await models.forgot_password_code.create({
        user_id: userExist.user_id,
        forgot_code: code,
        expired: expired,
      });

      return sendMailForgotPassword(res, transporter, mailForgotPass);
    }
  } catch (error) {
    return res.status(500).json({ message: "Error API forgotPassword" });
  }
};

//define controller change password
const resetPassword = async (req, res) => {
  try {
    // newPassword, code
    let { newPassword, code, email } = req.body;

    // kiểm tra email có tồn tại trong db hay không
    let userExists = await models.users.findOne({
      where: { email },
    });

    // TH1: email không tồn tại trong db
    if (!userExists) {
      return res
        .status(400)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // TH2: code có tồn tại trong db hay không
    let codeExists = await models.forgot_password_code.findOne({
      where: {
        user_id: userExists.user_id,
        forgot_code: code,
      },
    });

    if (!codeExists) {
      return res.status(400).json({ message: "Code không hợp lệ" });
    }

    // mã hóa new password
    let hashNewPassword = bcrypt.hashSync(newPassword, 10);
    // C1: dùng trực tiếp userExists để update
    // userExists.pass_word = hashNewPassword;
    // await userExists.save();

    // C2: dùng model để update
    await models.users.update(
      {
        pass_word: hashNewPassword,
      },
      {
        where: {
          user_id: userExists.user_id,
        },
      }
    );

    // xóa code trong db
    await models.forgot_password_code.destroy({
      where: {
        user_id: userExists.user_id,
      },
    });

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error API resetPassword" });
  }
};

export { register, login, forgotPassword, resetPassword };
