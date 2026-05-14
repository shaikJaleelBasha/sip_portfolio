import express from "express";
import { createFund, getFunds, updateFund } from "../controller/fundController";
import authenticateUser from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateUser, createFund);
router.get("/", authenticateUser, getFunds);
router.put("/:fundId/nav", authenticateUser, updateFund);

export default router;
