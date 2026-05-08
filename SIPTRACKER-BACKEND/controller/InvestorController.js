const express = require("express");
const { loginUser } = require("../model/InvestorModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../utility/dbManager.js");

const displayInvestors= async (req, res) => {
    const query = (`SELECT * FROM investors`);
    await db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching investors" });
      } else {
        return res.json(rows);
      }
    });
}


const getInvestorById = async (req, res) => {
   const investorId = req.params.investorId;
   const query = (`SELECT * FROM investors WHERE investorId = ?`);
   await db.get(query, [investorId], (err, row) => {
     if (err) {
       return res.status(500).json({ message: "Error fetching investor details" });
     } else if (!row) {
       return res.status(404).json({ message: "Investor not found" });
     } else {
       return res.json(row);
     }
   });
}

const getInvestorHoldings = async (req, res) => {
    const investorId = req.params.investorId;
    const query = `SELECT h.*, mf.fundName FROM holdings h
                   JOIN mutualFunds mf ON h.fundId = mf.fundId
                   WHERE h.investorId = ?`;
    db.all(query, [investorId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching holdings" });
        } else {
            return res.json(rows);
        }
    });
}

const getInvestorNetWorth = (req, res) => {
  const investorId = req.params.investorId;
  const query = `SELECT i.investorId, i.firstName, i.lastName, mf.fundName, h.totalUnits, nav.navValue, ROUND(h.totalUnits * nav.navValue, 2) AS currentValue
  FROM investors i JOIN holdings h ON i.investorId = h.investorId 
  JOIN mutualFunds mf ON h.fundId = mf.fundId
  JOIN fundNavHistory nav ON mf.fundId = nav.fundId
  WHERE i.investorId = ?`;
  db.all(
    query, [investorId], (err, rows) => {
      if(err){
        return res.status(500).json({message: err.message});
      }
      if(rows.length === 0){
        return res.status(400).json({message: "Investor Holding not found.."});
      }
      let totalNetWorth = 0;
      rows.forEach(row => {
        totalNetWorth += row.currentValue;
      });
      res.status(200).json({investorId: rows[0].investorId, 
        investorName : rows[0].firstName + rows[0].lastName, 
        holdings: rows,
        totalNetWorth: totalNetWorth.toFixed(2)
      });
    }
  );
}


module.exports = {
  displayInvestors,
   getInvestorById,
   getInvestorHoldings,
   getInvestorNetWorth
}