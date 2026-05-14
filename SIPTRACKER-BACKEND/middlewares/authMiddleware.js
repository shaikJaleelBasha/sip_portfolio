const { verifyJWT } = require("../utility/authManager");

const {errorResponse} = require("../utility/responseHandler.js");

const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return errorResponse(res, 401, "Token missing");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return errorResponse(res, 401, "Invalid token format");
        }

        const decoded = verifyJWT(token);

        req.user = decoded;

        next();
    } catch (error) {
        return errorResponse(
            res,
            401,
            "Invalid or expired token"
        );
    }
};

module.exports = authenticateUser;