const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middlewares/authMiddleware");

const {
    getAmcs
} = require("../controller/amcController");

router.get(
    "/",
    authenticateUser,
    getAmcs
);

module.exports = router;