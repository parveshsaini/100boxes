import { Router } from "express";
import { getUser, loginUser, signupUser } from "../controllers/user.controllers";
import authMiddleware from "../middleware/auth.middleware";

const userRouter: Router = Router()

userRouter.route("/signup").post(signupUser)

userRouter.route("/login").post(loginUser)

userRouter.route("/me").get(authMiddleware, getUser)

export default userRouter