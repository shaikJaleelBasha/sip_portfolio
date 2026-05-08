const db = require('../utility/pgManager.js');

const createSIP = async (req, res) => {
    try {
        const {investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status} = req.body;
        const query = `INSERT INTO sips (investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING sip_id`;
        const result = await db.query(query, [investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status]);
        return res.status(201).json({message : "SIP Created Successfully.. ", sip_id : result.rows[0].sip_id});
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({message : "Error Creating SIP.. ", error : error.message});
    }
}

const getSipById = async (req, res) => {
    try{
        const sip_id = req.params.sip_id;
        const query = `SELECT * FROM sips WHERE sip_id = $1`;
        const result = await db.query(query, [sip_id]);
        if(result.rows.length === 0){
            return res.status(400).json({message : "SIP Not Found.. "});
        }
        return res.status(200).json(result.rows[0]);
    }catch (err){
        return res.status(500).json({message : "Error fetching SIP Details.. ", error : err.message});
    }
}

const processSips = async (req, res) => {
    const client = await db.connect();
    try{
        const sip_id = req.params.sip_id;
        await client.query("BEGIN");
        const sipQuery = `SELECT * FROM sips WHERE sip_id = $1`;
        const sipResult = db.query(sipQuery, [sip_id]);

        if(sipResult.rows.length === 0){
            await client.query("ROLLBACK");
            return res.status(404).json({message : "SIP NOT FOUND.. "});
        }

        const sip = sipResult.rows[0];
        const navQuery = `SELECT * FROM fund_nav_history WHERE fund_id = $1 ORDER BY nav_date DESC LIMIT 1`;
        const navResult = db.query(navQuery, [sip.fund_id]);

        if(navResult.rows.length === 0){
            await client.query("ROLLBACK");
            return res.status(404).json({message : "Nav Details not found. "});
        }
        
        const nav = navResult.rows[0];
        const units = sip.sip_amount / nav.nav_value;

        const installmentQuery = `INSERT INTO sip_installments(sip_id, installment_date, amount, nav_value, units_allocated, transaction_status) 
        VALUES ($1, CURRENT_DATE, $2, $3, $4, $5) RETURNING inst_id`;
        const installmentResult = await client.query(installmentQuery, [sip.sip_id, sip.sip_amount, nav.nav_value, units, 'SUCCESS']);

        const installment_id = installmentResult.rows[0].inst_id;
        const transactionQuery = `INSERT INTO investment_transactions(investor_id, portfolio_id, fund_id, installment_id, transaction_type, transaction_amount, nav_value, units) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING transaction_id`;
        await client.query(transactionQuery, [sip.investor_id, sip.portfolio_id, sip.fund_id, 
            installment_id, "BUY", sip.sip_amount, nav.nav_value, units]);
        

        const holdingCheckQuery = `SELECT * FROM holdings WHERE investor_id = $1 AND fund_id = $2`;
        const holdingResult = await client.query(holdingCheckQuery, [sip.investor_id, sip.fund_id]);

        if(holdingResult.rows.length > 0){
            const holding = holdingResult.rows[0];
            const newUnits = parseFloat(holding.total_units) + parseFloat(units);
            const avgNav = ((holding.total_units * holding.average_purchase_nav) + (units * nav.nav_value)) / newUnits;

            const updateHoldingQuery = `UPDATE holdings SET total_units = $1, average_purchase_nav = $2 WHERE holding_id = $3`;
            await client.query(updateHoldingQuery, [newUnits, avgNav, holding.holding_id]);
        }
        else{
            const insertHoldingQuery = `INSERT INTO holdings (investor_id, portfolio_id, fund_id, total_units, average_purchase_nav)
            VALUES ($1, $2, $3, $4, $5)`;
            await client.query(insertHoldingQuery, [sip.investor_id, sip.portfolio_id, sip.fund_id, units, nav.nav_value]);
        }
        await client.query("COMMIT");
        return res.status(200).json({message : "SIP Processed Successfully.. ", installment_id});
    }catch(err){
        await client.query("ROLLBACK");
        console.log(err);
        return res.status(500).json({message : "Error Processing SIP", error : err.message});
    }finally{
        client.release();
    }
}

const getSIPTransactions = async(req, res) => {
    try {
        const sip_id = req.params.sip_id;
        const query = `SELECT
            it.transaction_id,
            mf.fund_name,
            it.transaction_type,
            it.transaction_amount,
            it.nav_value,
            it.units,
            it.transaction_date

            FROM investment_transactions it

            JOIN sips s
            ON it.investor_id = s.investor_id

            JOIN mutual_funds mf
            ON it.fund_id = mf.fund_id

            WHERE s.sip_id = $1`;
        
        const result = await db.query(query, [sip_id]);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({
            message : "Error Fetching SIP Transactions", error : error.message
        });
    }
}

module.exports = {
    createSIP,
    getSipById,
    processSips,
    getSIPTransactions
}