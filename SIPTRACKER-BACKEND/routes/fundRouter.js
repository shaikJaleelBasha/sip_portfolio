const express = require("express");

const {
    createFund,
    getFunds,
    updateFund
} = require("../controller/fundController.js");

const authenticateUser =
require("../middlewares/authMiddleware.js");

const router = express.Router();


// CREATE FUND
router.post(
    "/",
    authenticateUser,
    createFund
);


// GET FUNDS
router.get(
    "/",
    authenticateUser,
    getFunds
);


// UPDATE NAV
router.put(
    "/:fundId/nav",
    authenticateUser,
    updateFund
);

module.exports = router;