const db = require('../utility/pgManager.js');

const createFund = async(req, res) => {
    try{
        const { amc_id, fund_name, fund_code, fund_type} = req.body;
        const query = `INSERT INTO mutual_funds (amc_id, fund_name, fund_code, fund_type) VALUES ($1, $2, $3, $4) RETURNING fund_id`;
        const result = await db.query(query, [amc_id, fund_name, fund_code, fund_type]);
        return res.status(201).json({message : "Fund Created Successfully.. ", fund_id : result.rows[0].fundId});
    }catch(err){
        return res.status(500).json({message : "Error Creating Fund.. ", error : err.message});
    }
}

const getFunds = async(req, res) => {
    try {
        const query = `SELECT mf.*, a.amc_name FROM mutual_funds mf
         JOIN amcs a ON mf.amc_id = a.amc_id`;
        const result = await db.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({message : "Error Fetching funds", error : error.message});
    }
}

const updateFund = async(req, res) => {
    try{
        const fund_id = req.params.fundId;
        const { nav_value, nav_date} = req.body;
        const query = `INSERT INTO fund_nav_history(fund_id, nav_value, nav_date) VALUES ($1, $2, $3) RETURNING nav_id`;
        const result = await db.query(query, [fund_id, nav_value, nav_date]);
        return res.status(201).json({message : "Fund Updated Successfully.. ", nav_id : result.rows[0].nav_id,});
    }catch(err){
        console.log(err);
        return res.status(500).json({message : "Error updating the fund", error : err.message});
    }
}


module.exports = {
    createFund,
    getFunds,
    updateFund
}
