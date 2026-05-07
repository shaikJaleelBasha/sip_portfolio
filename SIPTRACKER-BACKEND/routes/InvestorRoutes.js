const router = require("express").Router();
const authenticateUser = require("../middlewares/authMiddleware.js")
const {displayInvestors, getInvestorById, getInvestorHoldings, getInvestorNetWorth} = require("../controller/InvestorController.js");

router.get("/investors", authenticateUser, displayInvestors);
router.get("/investors/:investorId", authenticateUser, getInvestorById);
router.get("/investors/:investorId/holdings", authenticateUser, getInvestorHoldings);
router.get("/investors/:investorId/networth",authenticateUser, getInvestorNetWorth);

module.exports = router;