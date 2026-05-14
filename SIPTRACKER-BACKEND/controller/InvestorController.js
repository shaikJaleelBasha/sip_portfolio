const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../poolManager.js");


const displayInvestors = async (req, res) => {

    try {

        const query = `
            SELECT
                i.investor_id,
                i.first_name,
                i.last_name,
                i.phone,
                i.dob,
                i.pan_number,
                i.aadhaar_number,
                i.address,
                i.created_at,
                u.email
            FROM investors i
            INNER JOIN users u
            ON i.user_id = u.user_id
            ORDER BY i.investor_id ASC
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            message: "Investors fetched successfully",
            investors: result.rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Error fetching investors",
            error: error.message
        });
    }
};



const createInvestor = async (req, res) => {

    try {

        const {
            user_id,
            first_name,
            last_name,
            phone,
            dob,
            pan_number,
            aadhaar_number,
            address
        } = req.body;

        // VALIDATION
        if (!user_id) {
            return res.status(400).json({
                message: "user_id is required"
            });
        }

        // CHECK USER EXISTS
        const userCheck = await pool.query(
            `SELECT * FROM users WHERE user_id = $1`,
            [user_id]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // CHECK INVESTOR ALREADY EXISTS
        const existingInvestor = await pool.query(
            `SELECT * FROM investors WHERE user_id = $1`,
            [user_id]
        );

        if (existingInvestor.rows.length > 0) {
            return res.status(400).json({
                message: "Investor already exists for this user"
            });
        }

        // INSERT INVESTOR
        const query = `
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
        `;

        const values = [
            user_id,
            first_name,
            last_name,
            phone,
            dob,
            pan_number,
            aadhaar_number,
            address
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            message: "Investor created successfully",
            investor: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Error creating investor",
            error: error.message
        });
    }
};


const getInvestorById = async (req, res) => {
  try {
    const investorId = req.params.investorId;

    const query = `
      SELECT *
      FROM investors
      WHERE investor_id = $1
    `;

    const result = await pool.query(query, [investorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Investor not found"
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching investor details",
      error: error.message
    });
  }
};


const getInvestorHoldings = async (req, res) => {
  try {
    const investorId = req.params.investorId;

    const query = `
      SELECT
          s.sip_id AS "sipId",
          mf.fund_name AS "fundName",
          mf.fund_type AS "fundType",
          s.sip_amount AS "sipAmount",
          s.sip_date AS "sipDate",
          s.start_date AS "startDate",
          s.end_date AS "endDate",
          s.sip_status AS "sipStatus",
          COUNT(si.inst_id) AS "totalInstallments",
          SUM(si.units_allocated) AS "totalUnits",
          ROUND(
              SUM(si.units_allocated * si.nav_value),
              2
          ) AS "currentValue"
      FROM sips s
      LEFT JOIN sip_installments si
          ON s.sip_id = si.sip_id
      JOIN mutual_funds mf
          ON s.fund_id = mf.fund_id
      WHERE s.investor_id = $1
      GROUP BY
          s.sip_id,
          mf.fund_name,
          mf.fund_type,
          s.sip_amount,
          s.sip_date,
          s.start_date,
          s.end_date,
          s.sip_status
    `;

    const result = await pool.query(query, [investorId]);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching holdings",
      error: error.message
    });
  }
};


const getInvestorNetWorth = async (req, res) => {
  try {
    const investorId = req.params.investorId;

    const query = `
      SELECT
          ROUND(
              SUM(si.units_allocated * si.nav_value),
              2
          ) AS "totalNetWorth"
      FROM sip_installments si
      JOIN sips s
          ON si.sip_id = s.sip_id
      WHERE s.investor_id = $1
      AND si.transaction_status = 'SUCCESS'
    `;

    const result = await pool.query(query, [investorId]);

    const netWorth = result.rows[0]?.totalNetWorth || 0;

    return res.status(200).json({
      totalNetWorth: parseFloat(netWorth)
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching net worth",
      error: error.message
    });
  }
};

const getInvestorDashboardTransactions = async (req, res) => {
  try {
    const investorId = req.params.investorId;

    const query = `
      SELECT
          si.inst_id AS "instId",
          mf.fund_name AS "fundName",
          mf.fund_type AS "fundType",
          s.sip_amount AS "sipAmount",
          si.amount AS "amount",
          si.installment_date AS "installmentDate",
          si.transaction_status AS "transactionStatus",
          si.nav_value AS "navValue",
          si.units_allocated AS "unitsAllocated"
      FROM sip_installments si
      JOIN sips s
          ON si.sip_id = s.sip_id
      JOIN mutual_funds mf
          ON s.fund_id = mf.fund_id
      WHERE s.investor_id = $1
      ORDER BY si.installment_date DESC
    `;

    const result = await pool.query(query, [investorId]);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching dashboard transactions",
      error: error.message
    });
  }
};

const getInvestorRecentPayments = async (req, res) => {
  try {
    const investorId = req.params.investorId;

    const query = `
      SELECT
          mf.fund_name AS "fundName",
          si.amount AS "amount",
          si.installment_date AS "installmentDate",
          si.transaction_status AS "transactionStatus"
      FROM sip_installments si
      JOIN sips s
          ON si.sip_id = s.sip_id
      JOIN mutual_funds mf
          ON s.fund_id = mf.fund_id
      WHERE s.investor_id = $1
      ORDER BY si.created_at DESC
      LIMIT 5
    `;

    const result = await pool.query(query, [investorId]);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching recent payments",
      error: error.message
    });
  }
};

module.exports = {
  displayInvestors,
  createInvestor,
  getInvestorById,
  getInvestorHoldings,
  getInvestorNetWorth,
  getInvestorDashboardTransactions,
  getInvestorRecentPayments
};