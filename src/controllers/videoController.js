// flow code
// code trong controller trước
// import connect from "../../db.js";
import initModels from "../models/init-models.js";
import connect from "../models/connect.js";
import { formatVideoList } from "../utils/formatData.js";

// để connect tới databae
// thì phải tạo kết nối tới databse thông qua initModels
// connect: địa chỉ kết nối tới database
const models = initModels(connect);

//----------- Controller video
const createVideo = async (req, res) => {
  try {
    // const queryString = `
    //     INSERT INTO videos(video_name,thumbnail,description) VALUES
    //     (?,?,?)
    // `;
    // //lấy body từ request
    // let body = req.body;
    // let { video_name, thumbnail, description } = body;
    // //thực thi execute
    // const [data] = await connect.execute(queryString, [
    //   video_name,
    //   thumbnail,
    //   description,
    // ]);
    // return res.send(data);

    //sử dụng sequelize

    const { video_name, description, thumbnail, views, source, type_id } =
      req.body;
    console.log("dữ liệu từ body", {
      video_name,
      description,
      thumbnail,
      views,
      source,
      type_id,
    });

    res.status(200).json(`createVideo`);
  } catch (error) {
    console.error(`Error creating video: ${error}`);
    res.status(500).send(`Error: ${error}`);
  }
};

//controller list video
const listVideo = async (req, res) => {
  try {
    const listVideos = await models.videos.findAll();

    //formaty dữ liệu của thằng listVideos
    const listVideosFormatted = formatVideoList(listVideos);
    //2xx: trả dữ liệu thành công
    //201: created
    return res.status(200).json(listVideosFormatted);
  } catch (error) {
    console.error(error);
    //5xx : lỗi của hệ thống
    //VD: 500, 501, 502
    return res.status(500).json({ message: "Error Api list video" });
  }
};

// ----------------- Controller video-type
// CREATE
const createVideoType = async (req, res) => {
  try {
    const { type_name } = req.body;
    console.log("Dữ liệu body", type_name);
    const result = await models.video_types.create({
      type_name: type_name,
    });
    console.log("kết quả tạo video type", result.toJSON());

    res.status(200).json(result);
  } catch (error) {
    console.log(`Error ${error}`);
    res.status(500).json(error);
  }
};

//READ
//controller getVideoTypes
const getVideoTypes = async (req, res) => {
  try {
    const listVideoTypes = await models.video_types.findAll();
    return res.status(200).json(listVideoTypes);
  } catch (error) {
    return res.status(500).json({ message: "Error Api get video types" });
  }
};

export { createVideo, listVideo, getVideoTypes, createVideoType };
