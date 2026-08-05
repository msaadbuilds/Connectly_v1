import express from 'express'
import { checkAuth, login, sendOTP, signup, updateProfile, verifyOTP} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.post("/sendotp", sendOTP);
userRouter.post("/verifyotp", verifyOTP);

export default userRouter;