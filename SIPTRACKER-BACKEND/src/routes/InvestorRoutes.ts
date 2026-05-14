import express from "express";
import authenticateUser from "../middleware/authMiddleware";
import {
  displayInvestors,
  getInvestorById,
  getInvestorHoldings,
  getInvestorNetWorth,
  getInvestorDashboardTransactions,
  getInvestorRecentPayments,
  createInvestor,
} from "../controller/InvestorController";

const router = express.Router();

router.get("/investors", authenticateUser, displayInvestors);
router.get("/investors/:investorId", authenticateUser, getInvestorById);
router.get(
  "/investors/:investorId/holdings",
  authenticateUser,
  getInvestorHoldings,
);
router.get(
  "/investors/:investorId/networth",
  authenticateUser,
  getInvestorNetWorth,
);
router.get(
  "/investors/:investorId/transactions",
  authenticateUser,
  getInvestorDashboardTransactions,
);
router.get(
  "/investors/:investorId/recent-payments",
  authenticateUser,
  getInvestorRecentPayments,
);
router.post("/investors", createInvestor);

export default router;
