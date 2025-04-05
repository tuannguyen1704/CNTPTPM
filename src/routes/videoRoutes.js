//đây là nơi define tất cả các routes liên quan tới video
import express from "express";
import {
  createVideo,
  createVideoType,
  getVideoTypes,
  listVideo,
} from "../controllers/videoController.js";

//tạo videoRoutes
const videoRoutes = express.Router();
videoRoutes.post("/create-video", createVideo);

//define API list video
//READ
videoRoutes.get("/list-video", listVideo);

//video type
//CREATE
videoRoutes.post("/create-video-types", createVideoType);

//define API
//READ
videoRoutes.get("/get-video-types", getVideoTypes);

export default videoRoutes;
