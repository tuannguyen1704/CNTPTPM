import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();

//define hàm tọa access token
const createAccessToken = (payload) => {
  return jwt.sign({ payload }, process.env.SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "2h",
  });
};

//define hàm verify access token
const verifyAccessToken = (accessToken) => {
  try {
    jwt.verify(accessToken, process.env.SECRET_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

//define middleware để check token
//next:chuyển tiếp request tơi middleware tiếp theo hoặc controller
const middlewareToken = (req, res, next) => {
  let { token } = req.headers;
  console.log("token", token);
  //TH1:token kh có trong header của request
  if (!token) {
    //mã lỗi 4XX: lỗi của user
    return res.status(401).json({ message: "Unauthorized" });
  }
  let checkToken = verifyAccessToken(token);
  //TH02: token không hợp lệ
  if (!checkToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  //TH03: token hợp lệ
  next();
};

export { createAccessToken, verifyAccessToken, middlewareToken };
