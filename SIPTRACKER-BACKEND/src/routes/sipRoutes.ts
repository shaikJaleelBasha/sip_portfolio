import express from "express";
import authenticateUser from "../middleware/authMiddleware";
import {
  createSIP,
  getSipById,
  processSips,
  getSIPTransactions,
} from "../controller/sipController";

const router = express.Router();

router.post("/", authenticateUser, createSIP);
router.get("/:sipId", authenticateUser, getSipById);
router.post("/:sipId/process", authenticateUser, processSips);
router.get("/:sipId/transactions", authenticateUser, getSIPTransactions);

export default router;
