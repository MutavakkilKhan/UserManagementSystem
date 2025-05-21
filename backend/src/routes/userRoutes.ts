import { Router } from "express";
import { register, login, listUsers, checkEmail, getMe, updateManager } from "../controllers/userController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", listUsers); // Debug only, remove in production
router.get("/check-email", checkEmail);
router.get("/me", authenticateToken, getMe);
router.patch("/manager-email", authenticateToken, updateManager);

export default router; 