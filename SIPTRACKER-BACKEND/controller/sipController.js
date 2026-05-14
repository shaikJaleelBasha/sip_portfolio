const pool = require('../poolManager.js');

// -----------------------------
// CREATE SIP
// -----------------------------
const createSIP = async (req, res) => {
    try {
        const {
            sipId,
            investorId,
            fundId,
            sipAmount,
            sipDate,
            startDate,
            endDate,
            sipStatus
        } = req.body;

        // Auto-fetch or create portfolio for the investor
        let portRes = await pool.query('SELECT portfolio_id FROM portfolios WHERE investor_id = $1', [investorId]);
        let portfolioId;
        if (portRes.rows.length === 0) {
             const newPortRes = await pool.query('INSERT INTO portfolios (investor_id) VALUES ($1) RETURNING portfolio_id', [investorId]);
             portfolioId = newPortRes.rows[0].portfolio_id;
        } else {
             portfolioId = portRes.rows[0].portfolio_id;
        }

        let query, values;
        
        if (sipId) {
            query = `
                INSERT INTO sips 
                (sip_id, investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING sip_id
            `;
            values = [sipId, investorId, portfolioId, fundId, sipAmount, sipDate, startDate, endDate, sipStatus];
        } else {
            query = `
                INSERT INTO sips 
                (investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING sip_id
            `;
            values = [investorId, portfolioId, fundId, sipAmount, sipDate, startDate, endDate, sipStatus];
        }

        const result = await pool.query(query, values);

        return res.status(201).json({
            message: "SIP created successfully",
            sipId: result.rows[0].sip_id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating SIP" });
    }
};


// -----------------------------
// GET SIP BY ID
// -----------------------------
const getSipById = async (req, res) => {
    try {
        const { sipId } = req.params;

        const query = `
            SELECT * 
            FROM sips 
            WHERE sip_id = $1
        `;

        const result = await pool.query(query, [sipId]);
        const row = result.rows[0];

        if (!row) {
            return res.status(404).json({ message: "SIP not found" });
        }

        // map DB → API format
        return res.json({
            sipId: row.sip_id,
            investorId: row.investor_id,
            portfolioId: row.portfolio_id,
            fundId: row.fund_id,
            sipAmount: row.sip_amount,
            sipDate: row.sip_date,
            startDate: row.start_date,
            endDate: row.end_date,
            sipStatus: row.sip_status
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching SIP details" });
    }
};


// -----------------------------
// PROCESS SIP (TRANSACTION)
// -----------------------------
const processSips = async (req, res) => {
    const { sipId } = req.params;
    
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        // 1. Get SIP
        const sipRes = await client.query(`SELECT * FROM sips WHERE sip_id = $1`, [sipId]);
        const sip = sipRes.rows[0];
        
        if (!sip) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "SIP not found" });
        }

        // 2. Get latest NAV
        const navRes = await client.query(`
            SELECT * FROM fund_nav_history 
            WHERE fund_id = $1 
            ORDER BY nav_date DESC 
            LIMIT 1
        `, [sip.fund_id]);
        
        const nav = navRes.rows[0];
        if (!nav) {
            await client.query("ROLLBACK");
            return res.status(500).json({ message: "Error fetching NAV" });
        }

        const units = sip.sip_amount / nav.nav_value;

        // 3. Insert SIP installment
        const installRes = await client.query(`
            INSERT INTO sip_installments
            (sip_id, installment_date, amount, nav_value, units_allocated, transaction_status)
            VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
            RETURNING inst_id
        `, [
            sip.sip_id,
            sip.sip_amount,
            nav.nav_value,
            units,
            "SUCCESS"
        ]);
        
        const dbInstallmentId = installRes.rows[0].inst_id;

        // 4. Insert transaction
        await client.query(`
            INSERT INTO investment_transactions
            (investor_id, portfolio_id, fund_id, installment_id, transaction_type, transaction_amount, nav_value, units, transaction_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
        `, [
            sip.investor_id,
            sip.portfolio_id,
            sip.fund_id,
            dbInstallmentId,
            "BUY",
            sip.sip_amount,
            nav.nav_value,
            units
        ]);

        await client.query("COMMIT");

        return res.json({
            message: "SIP processed successfully",
            installmentId: dbInstallmentId,
            units
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ message: "Transaction error" });
    } finally {
        client.release();
    }
};


// -----------------------------
// GET SIP TRANSACTIONS
// -----------------------------
const getSIPTransactions = async (req, res) => {
    try {
        const { sipId } = req.params;

        const query = `
            SELECT
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

            WHERE s.sip_id = $1
        `;

        const result = await pool.query(query, [sipId]);

        // map DB → API format
        const response = result.rows.map(r => ({
            transactionId: r.transaction_id,
            fundName: r.fund_name,
            transactionType: r.transaction_type,
            transactionAmount: r.transaction_amount,
            navValue: r.nav_value,
            units: r.units,
            transactionDate: r.transaction_date
        }));

        return res.json(response);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching transactions" });
    }
};


// -----------------------------
// EXPORTS
// -----------------------------
module.exports = {
    createSIP,
    getSipById,
    processSips,
    getSIPTransactions
};