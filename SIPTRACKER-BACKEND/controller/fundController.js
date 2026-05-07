const db = require('../utility/dbManager.js');

const createFund = (req, res) => {
    const { fundId, amcId, fundName, fundCode, fundType} = req.body;
    db.run(`INSERT INTO mutualFunds (fundId, amcId, fundName, fundCode, fundType) VALUES (?, ?, ?, ?, ?)`,
        [fundId, amcId, fundName, fundCode, fundType], function(err) {
            if (err) {
                return res.status(500).json({ message: "Error creating fund" });
            }
        });
    res.status(201).json({ message: "Fund created successfully"});
}

const getFunds = (req, res) => {
    db.all(`SELECT mf.*, a.amcName FROM mutualFunds mf
         JOIN amcs a ON mf.amcId = a.amcId`,[], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: "Error fetching funds" });
            }
            return res.json(rows);
        });
}

const updateFund = (req, res) => {
    const fundId = req.params.fundId;
    const { navId, navValue, navDate} = req.body;
    const query = `INSERT INTO fundNavHistory(navId, fundId, navValue, navDate) VALUES (?, ?, ?, ?)`;
    db.run(query, [navId, fundId, navValue, navDate], function(err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error updating fund NAV" });
        }
        res.json({ message: "Fund NAV updated successfully" });
    });
}


module.exports = {
    createFund,
    getFunds,
    updateFund
}
