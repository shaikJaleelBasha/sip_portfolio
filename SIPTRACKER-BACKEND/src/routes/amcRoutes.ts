import express from "express";
import authenticateUser from "../middleware/authMiddleware";
import { getAmcs } from "../controller/amcController";

const router = express.Router();

router.get("/", authenticateUser, getAmcs);

export default router;
