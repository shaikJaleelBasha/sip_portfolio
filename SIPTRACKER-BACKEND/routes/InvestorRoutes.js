const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware.js")
const {displayInvestors, getInvestorById, getInvestorHoldings, getInvestorNetWorth, getInvestorDashboardTransactions, getInvestorRecentPayments, createInvestor} = require("../controller/InvestorController.js");

router.get("/investors", authenticateUser, displayInvestors);
router.get("/investors/:investorId", authenticateUser, getInvestorById);
router.get("/investors/:investorId/holdings", authenticateUser, getInvestorHoldings);
router.get("/investors/:investorId/networth",authenticateUser, getInvestorNetWorth);
router.get("/investors/:investorId/transactions", authenticateUser, getInvestorDashboardTransactions);
router.get("/investors/:investorId/recent-payments", authenticateUser, getInvestorRecentPayments);
router.post('/investors', createInvestor);

module.exports = router;