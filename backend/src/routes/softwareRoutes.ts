import { Router } from "express";
import { listSoftware, createSoftware } from "../controllers/softwareController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, listSoftware);
router.post("/", authenticateToken, requireAdmin, createSoftware);

export default router; 