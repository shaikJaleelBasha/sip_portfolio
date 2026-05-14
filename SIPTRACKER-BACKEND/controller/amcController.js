const pool = require("../poolManager");

// GET ALL AMCS
const getAmcs = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT *
            FROM amcs
            ORDER BY amc_name ASC
            `
        );

        return res.status(200).json(
            result.rows
        );

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Error fetching AMCs"
        });
    }
};

module.exports = {
    getAmcs
};