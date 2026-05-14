import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../poolManager";
import { generateToken } from "../utility/authManager";
import { successResponse } from "../utility/responseHandler";

const JWT_SECRET = "SPITRACKER_AND_PORTFOLIOVALUATION_AS_SECRET_KEY";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      dob,
      pan_number,
      aadhaar_number,
      address,
    } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and Password are required",
      });
      return;
    }

    const existingUser = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        message: "Email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userInsert = await pool.query(
      `
      INSERT INTO users(email, password)
      VALUES($1, $2)
      RETURNING user_id, email
      `,
      [email, hashedPassword],
    );

    const userId = userInsert.rows[0].user_id;

    const investorInsert = await pool.query(
      `
      INSERT INTO investors
      (
        user_id,
        first_name,
        last_name,
        phone,
        dob,
        pan_number,
        aadhaar_number,
        address
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        userId,
        first_name,
        last_name,
        phone,
        dob,
        pan_number,
        aadhaar_number,
        address,
      ],
    );

    const newInvestorId = investorInsert.rows[0].investor_id;

    const portfolioInsert = await pool.query(
      `INSERT INTO portfolios (investor_id) VALUES ($1) RETURNING *`,
      [newInvestorId],
    );

    res.status(201).json({
      message: "User Registered Successfully",
      user: userInsert.rows[0],
      investor: investorInsert.rows[0],
      portfolio: portfolioInsert.rows[0],
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const query = `
      SELECT
        u.user_id,
        u.email,
        u.password,
        i.investor_id,
        i.first_name,
        i.last_name
      FROM users u
      LEFT JOIN investors i
      ON u.user_id = i.user_id
      WHERE u.email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateToken({
      user_id: user.user_id,
      investor_id: user.investor_id,
      email: user.email,
    });

    successResponse(res, 200, "Login Successful...", {
      token,
      investor: {
        user_id: user.user_id,
        investor_id: user.investor_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export { register, login };
