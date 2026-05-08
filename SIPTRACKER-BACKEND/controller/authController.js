const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../utility/dbManager.js");
const { generateToken } = require("../utility/authManager.js");
const {successResponse, errorResponse} = require("../utility/responseHandler.js")

const JWT_SECRET = 'SPITRACKER_AND_PORTFOLIOVALUATION_AS_SECRET_KEY';

const register = async (req, res) => {
    try {
        const {email, password, firstName, lastName, phone, dob, panNumber, adhaarNumber, address} = req.body;
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
            if (err) {
                return res.status(500).json({message: err.message});
            }
            if(row){
                return res.status(400).json({message: "Email already Exists"});
            }
            db.get(`SELECT MAX(userId) AS lastId FROM users`, async(err, result) => {
                if(err){
                    return res.status(500).json({message: err.message});
                }
                const userId = result.lastId ? result.lastId + 1 : 1;
                const hashedPassword = await bcrypt.hash(password, 10);
                db.run(`INSERT INTO users (userId, email, password) VALUES (?, ?, ?)`,
                    [userId, email, hashedPassword], function(err){
                        if(err){
                            return res.status(500).json({message: "Error Registering User.."});
                        }
                        db.get(`SELECT MAX(investorId) AS lastInvestorId FROM investors`,
                            (err, investorResult) => {
                                if(err){
                                    return res.status(500).json({message: err.message});
                                }
                                const investorId = investorResult.lastInvestorId ? investorResult.lastInvestorId + 1 : 1;
                                db.run(`INSERT INTO investors(investorId, userId, firstName, lastName, phone, dob, panNumber, adhaarNumber, address)
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [investorId, userId, firstName, lastName, phone, dob, panNumber, adhaarNumber, address],
                                function(err){
                                    if(err){
                                        return res.status(500).json({message: err.message});
                                    }
                                    return res.status(200).json({message: "User Registered Successfully... "})
                                })
                            }
                        )

                    }
                )
            });
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
        const query = `SELECT u.userId, u.email, u.password,
                i.investorId, i.firstName, i.lastName FROM users u
                JOIN investors i ON u.userId = i.userId WHERE u.email = ?`;
        db.get(query, [email], async (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message,
                });
            } else if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password",
                });
            } else {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({
                        message: "Invalid email or password",
                    });
                }
                const token = generateToken({
                    investorId : user.investorId,
                    email: user.email
                })
                return successResponse(res, 200, "Login Successful... ", {
                    token,
                    investor: {
                        userId : user.userId,
                        investorId: user.investorId,
                        firstName: user.firstName,
                        lastName : user.lastName,
                        email : user.email
                    }
                })
            }
        });
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