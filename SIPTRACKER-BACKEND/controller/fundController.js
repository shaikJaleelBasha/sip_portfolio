const pool = require("../poolManager.js");


// =============================================
// CREATE FUND
// =============================================
const createFund = async (req, res) => {

    try {

        console.log(req.body);

        const {
            amcId,
            fundName,
            fundCode,
            fundType
        } = req.body;

        // VALIDATION
        if (
            !amcId ||
            !fundName ||
            !fundCode ||
            !fundType
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const query = `
            INSERT INTO mutual_funds
            (
                amc_id,
                fund_name,
                fund_code,
                fund_type
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [
            amcId,
            fundName,
            fundCode,
            fundType
        ];

        const result = await pool.query(
            query,
            values
        );

        return res.status(201).json({
            success: true,
            message: "Fund created successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Error creating fund"
        });
    }
};


// =============================================
// GET FUNDS
// =============================================
const getFunds = async (req, res) => {

    try {

        const query = `
            SELECT
                mf.fund_id,
                mf.amc_id,
                mf.fund_name,
                mf.fund_code,
                mf.fund_type,

                a.amc_name,

                (
                    SELECT nav_value
                    FROM fund_nav_history fnh
                    WHERE fnh.fund_id = mf.fund_id
                    ORDER BY nav_date DESC
                    LIMIT 1
                ) AS latest_nav

            FROM mutual_funds mf

            JOIN amcs a
            ON mf.amc_id = a.amc_id

            ORDER BY mf.fund_id DESC
        `;

        const result = await pool.query(query);

        const response = result.rows.map((r) => ({
            fundId: r.fund_id,
            amcId: r.amc_id,
            fundName: r.fund_name,
            fundCode: r.fund_code,
            fundType: r.fund_type,
            amcName: r.amc_name,
            latestNav: r.latest_nav || 0
        }));

        return res.status(200).json(response);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Error fetching funds"
        });
    }
};


// =============================================
// UPDATE NAV
// =============================================
const updateFund = async (req, res) => {

    try {

        const { fundId } = req.params;

        const {
            navValue,
            navDate
        } = req.body;

        if (!navValue || !navDate) {
            return res.status(400).json({
                message: "navValue and navDate required"
            });
        }

        const query = `
            INSERT INTO fund_nav_history
            (
                fund_id,
                nav_value,
                nav_date
            )
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [
            fundId,
            navValue,
            navDate
        ];

        const result = await pool.query(
            query,
            values
        );

        return res.status(200).json({
            success: true,
            message: "NAV updated successfully",
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Error updating NAV"
        });
    }
};


// =============================================
// EXPORTS
// =============================================
module.exports = {
    createFund,
    getFunds,
    updateFund
};