const pool = require('../poolManager.js');

// -----------------------------
// CREATE FUND
// -----------------------------
const createFund = async (req, res) => {
    try {
        const {
            fundId,
            amcId,
            fundName,
            fundCode,
            fundType
        } = req.body;

        let query, values;
        
        // If fundId is provided, we insert it, otherwise we let the DB auto-generate
        if (fundId) {
            query = `
                INSERT INTO mutual_funds 
                (fund_id, amc_id, fund_name, fund_code, fund_type)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING fund_id
            `;
            values = [fundId, amcId, fundName, fundCode, fundType];
        } else {
            query = `
                INSERT INTO mutual_funds 
                (amc_id, fund_name, fund_code, fund_type)
                VALUES ($1, $2, $3, $4)
                RETURNING fund_id
            `;
            values = [amcId, fundName, fundCode, fundType];
        }

        const result = await pool.query(query, values);

        return res.status(201).json({
            message: "Fund created successfully",
            fundId: result.rows[0].fund_id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating fund" });
    }
};


// -----------------------------
// GET ALL FUNDS
// -----------------------------
const getFunds = async (req, res) => {
    try {
        const query = `
            SELECT 
                mf.*,
                a.amc_name,
                (SELECT nav_value 
                 FROM fund_nav_history fnh 
                 WHERE fnh.fund_id = mf.fund_id 
                 ORDER BY nav_date DESC 
                 LIMIT 1) as latest_nav
            FROM mutual_funds mf
            JOIN amcs a 
                ON mf.amc_id = a.amc_id
        `;

        const result = await pool.query(query);

        // optional mapping for frontend consistency
        const response = result.rows.map(r => ({
            fundId: r.fund_id,
            amcId: r.amc_id,
            fundName: r.fund_name,
            fundCode: r.fund_code,
            fundType: r.fund_type,
            amcName: r.amc_name,
            latestNav: r.latest_nav || 0
        }));

        return res.json(response);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching funds" });
    }
};


// -----------------------------
// UPDATE FUND NAV (INSERT NAV HISTORY)
// -----------------------------
const updateFund = async (req, res) => {
    try {
        const { fundId } = req.params;
        const { navId, navValue, navDate } = req.body;

        let query, values;

        if (navId) {
            query = `
                INSERT INTO fund_nav_history 
                (nav_id, fund_id, nav_value, nav_date)
                VALUES ($1, $2, $3, $4)
                RETURNING nav_id
            `;
            values = [navId, fundId, navValue, navDate];
        } else {
            query = `
                INSERT INTO fund_nav_history 
                (fund_id, nav_value, nav_date)
                VALUES ($1, $2, $3)
                RETURNING nav_id
            `;
            values = [fundId, navValue, navDate];
        }

        const result = await pool.query(query, values);

        return res.json({
            message: "Fund NAV updated successfully",
            navId: result.rows[0].nav_id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating fund NAV" });
    }
};


// -----------------------------
// EXPORTS
// -----------------------------
module.exports = {
    createFund,
    getFunds,
    updateFund
};