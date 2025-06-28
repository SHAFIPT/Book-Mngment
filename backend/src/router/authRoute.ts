import { Router } from "express";
import { authController } from "../config/container";
import { loginValidation, registerValidation } from "../middleware/validation/authValidation";
import { authenticate } from "../middleware/authMiddleware";

const authRoute = Router();      

authRoute.post("/register", registerValidation, authController.register);
authRoute.post("/login", loginValidation, authController.login);
authRoute.post('/refresh-token', authController.refreshToken);
authRoute.post('/logout', authenticate, authController.logout);

export default authRoute;