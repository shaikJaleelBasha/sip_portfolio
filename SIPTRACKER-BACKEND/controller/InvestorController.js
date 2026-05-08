const express = require("express");
const { loginUser } = require("../model/InvestorModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../utility/pgManager.js");

const displayInvestors= async (req, res) => {
  try {
    const query = (`SELECT * FROM investors`);
    const result = await db.query(query);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({message : "Error Fetching Investors.. ", error: err.message});
  }
}


const getInvestorById = async (req, res) => {
  try {
    const investor_id = req.params.investor_id;
    const query = (`SELECT * FROM investors WHERE investor_id = $1`);
    const result = await db.query(query, [investor_id]);

    if(result.rows.length === 0){
      return res.status(401).json({message : "Investor Not Found.. "});
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({message : "Error fetching investor details", error: err.message,});
  }
}

const getInvestorHoldings = async (req, res) => {
  try {
    const investor_id = req.params.investor_id;
    const query = `SELECT h.*, mf.fund_name FROM holdings h
                   JOIN mutual_funds mf ON h.fund_id = mf.fund_id
                   WHERE h.investor_id = $1`;  
    const result = await db.query(query, [investor_id]);
    return res.status(200).json(result.rows);  
  } catch (error) {
    return res.status(500).json({message : "Error fetching holdings", error : error.message});
  }
}

const getInvestorNetWorth = async (req, res) => {
  try {
    const investor_id = req.params.investor_id;
    const query = `SELECT i.investor_id, i.first_name, i.last_name, mf.fund_name, h.total_units, nav.nav_value, ROUND((h.total_units * nav.nav_value)::numeric, 2) AS current_value
    FROM investors i JOIN holdings h ON i.investor_id = h.investor_id 
    JOIN mutual_funds mf ON h.fund_id = mf.fund_id
    JOIN fund_nav_history nav ON mf.fund_id = nav.fund_id
    WHERE i.investor_id = $1`;
    const result = await db.query(query, [investor_id]);

    if(result.rows.length === 0){
      return res.status(404).json({message : "Investor holding not found.. "});
    }
    let totalNetWorth = 0;
    result.rows.forEach((row) => {
      totalNetWorth += parseFloat(row.current_value);
    });

    return res.status(200).json({
      investor_id : result.rows[0].investor_id,
      investor_name : result.rows[0].first_name + " " + result.rows[0].last_name,
      holdings : result.rows,
      totalNetWorth : totalNetWorth.toFixed(2),
    });
  } catch (error) {
    return res.status(500).json({message : error.message});
  }
}

module.exports = {
  displayInvestors,
  getInvestorById,
  getInvestorHoldings,
  getInvestorNetWorth
};