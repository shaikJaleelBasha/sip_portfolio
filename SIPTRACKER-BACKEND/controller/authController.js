const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../utility/pgManager.js");
const { generateToken } = require("../utility/authManager.js");
const {successResponse, errorResponse} = require("../utility/responseHandler.js")

const JWT_SECRET = 'SPITRACKER_AND_PORTFOLIOVALUATION_AS_SECRET_KEY';

const register = async (req, res) => {
    try {
        const {email, password, first_name, last_name, phone, dob, pan_number, adhaar_number, address} = req.body;
        const checkUserQuery = `SELECT * FROM users WHERE email = $1`;
        const existingUser = await db.query(checkUserQuery, [email]);

        if(existingUser.rows.length > 0){
            return res.status(400).json({message : "Email already Exists.. "});
        }
        const hashed_password = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING user_id`;
        const userResult = await db.query(insertQuery, [email, hashed_password]);

        const user_id = userResult.rows[0].user_id;
        const insertInvestorQuery = `INSERT INTO investors (user_id, first_name, last_name, phone, dob, pan_number, adhaar_number, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING investor_id`;
        const investorResult = await db.query(insertInvestorQuery, [user_id, first_name, last_name, phone, dob, pan_number, adhaar_number, address]);

        return successResponse(res, 201, "User Registered Successfully... ", {
            user_id,
            investor_id : investorResult.rows[0].investor_id
        });
    }catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}


const login = async(req, res) => {
    try {
        const {email, password} = req.body;
        const query = `SELECT u.user_id, u.email, u.password, i.investor_id, i.first_name, i.last_name
        FROM users u JOIN investors i ON u.user_id = i.user_id WHERE u.email = $1`;
        const result = await db.query(query, [email]);

        if(result.rows.length === 0){
            return res.status(401).json({message : "Invalid Email or Password.. "});
        }
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message : "Invalid Email or Password.. "});
        }

        const token = generateToken({
            investorId : user.investor_id,
            email : user.email
        })

        return successResponse(res, 200, "Login Successfull.. ", {
            token,
            investor : {
                user_id : user.user_id,
                investor_id : user.investor_id,
                first_name : user.first_name,
                last_name : user.last_name,
                email : user.email
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    register,
    login
};