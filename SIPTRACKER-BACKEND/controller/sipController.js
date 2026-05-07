const db = require('../utility/dbManager.js');

const createSIP = (req, res) => {
    const {sipId, investorId, portfolioId, fundId, sipAmount, sipDate, startDate, endDate, sipStatus} = req.body;
    const query = `INSERT INTO sips (sipId, investorId, portfolioId, fundId, sipAmount, sipDate, startDate, endDate, sipStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [sipId, investorId, portfolioId, fundId, sipAmount, sipDate, startDate, endDate, sipStatus], function(err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error creating SIP" });
        }
        res.status(201).json({ message: "SIP created successfully", sipId: this.lastID });
    });
}

const getSipById = (req, res) => {
    const sipId = req.params.sipId;
    const query = `SELECT * FROM sips WHERE sipId = ?`;
    db.get(query, [sipId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching SIP details" });
        } else if (!row) {
            return res.status(404).json({ message: "SIP not found" });
        }
        return res.json(row);
    });
}

const processSips = (req, res) => {
    const sipId = req.params.sipId;
    const investorId = req.params.investorId;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.get(`SELECT * FROM sips WHERE sipId = ?`, [sipId], (err, sip) => {
            if(err || !sip){
                db.run('ROLLBACK');
                return res.status(500).json({ message: "Error processing SIP" });
            }
        db.get(`SELECT * FROM fundNavHistory WHERE fundId = ? ORDER BY navDate DESC LIMIT 1`, 
            [sip.fundId], (err, nav) => {
                if(err || !nav){
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: "Error fetching NAV details" });
                }
                const units = sip.sipAmount / nav.navValue;
                const installmentId = Date.now();
                db.run(`INSERT INTO sipInstallments(instId, sipId, installmentDate, amount, navValue, unitsAllocated, transactionStatus) VALUES (?, ?, date('now'), ?, ?, ?, ?)`, 
                    [installmentId, sip.sipId, sip.sipAmount, nav.navValue, units, 'SUCCESS'], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ message: "Error processing SIP" });
                    }
                    const installmentId = this.lastID;
                    db.run(`INSERT INTO investmentTransactions(transactionId, investorId, portfolioId, fundId, installmentId, transactionType, transactionAmount, navValue, units) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [Date.now()+1, sip.investorId, sip.portfolioId, sip.fundId, installmentId, 'BUY', sip.sipAmount, nav.navValue, units], function(err) {
                            if(err){
                                db.run('ROLLBACK');
                                return res.status(500).json({ message: "Error recording transaction" });
                            }
                            db.run('COMMIT');
                            return res.json({ message: "SIP processed successfully", installmentId: installmentId });
                    });
                });
            });
        });
    });
}

const getSIPTransactions = (req, res) => {
    const sipId = req.params.sipId;
    const query = `
        SELECT
            it.transactionId,
            mf.fundName,
            it.transactionType,
            it.transactionAmount,
            it.navValue,
            it.units,
            it.transactionDate

        FROM investmentTransactions it

        JOIN sips s
        ON it.investorId = s.investorId

        JOIN mutualFunds mf
        ON it.fundId = mf.fundId

        WHERE s.sipId = ?
    `;
    db.all(query, [sipId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching SIP transactions" });
        }
        return res.json(rows);
    });
}


module.exports = {
    createSIP,
    getSipById,
    processSips,
    getSIPTransactions
}