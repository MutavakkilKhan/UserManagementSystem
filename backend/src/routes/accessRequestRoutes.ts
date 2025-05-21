import { Router } from "express";
import {
  createAccessRequest,
  listAccessRequests,
  updateAccessRequest,
} from "../controllers/accessRequestController";
import { authenticateToken, requireManager } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, createAccessRequest);
router.get("/", authenticateToken, requireManager, listAccessRequests);
router.patch("/:id", authenticateToken, requireManager, updateAccessRequest);

export default router; 