//define tất cả API dành riêng cho table users
// defint userRoutes
import express from "express";
import { getUsers, createUsers } from "../controllers/userController.js";
import { middlewareToken } from "../config/jwt.js";

//tạo userRoutes
const userRoutes = express.Router();

//define API
userRoutes.get("/get-users", getUsers);

//API create-user
userRoutes.post("/create-user", middlewareToken, createUsers);
//export userRoutes
export default userRoutes;
