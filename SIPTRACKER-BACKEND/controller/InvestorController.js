const db = require("../utility/pgManager.js");

const { redisClient } = require("../utility/redis.js");


// ======================================================
// DISPLAY ALL INVESTORS
// ======================================================

const displayInvestors = async (req, res) => {
  try {

    const cachedInvestors =
      await redisClient.get("all_investors");

    if (cachedInvestors) {

      console.log("Investors fetched from Redis..");

      return res
        .status(200)
        .json(JSON.parse(cachedInvestors));
    }

    const query = `
      SELECT *
      FROM investors
    `;

    const result = await db.query(query);

    await redisClient.set(
      "all_investors",
      JSON.stringify(result.rows),
      { EX: 3600 }
    );

    console.log("Investors stored in Redis..");

    return res.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error Fetching Investors",
      error: error.message
    });
  }
};


// ======================================================
// GET INVESTOR BY ID
// ======================================================

const getInvestorById = async (req, res) => {
  try {

    const investor_id = req.params.investor_id;

    const cachedInvestor =
      await redisClient.get(`investor_${investor_id}`);

    if (cachedInvestor) {

      console.log("Investor fetched from Redis..");

      return res
        .status(200)
        .json(JSON.parse(cachedInvestor));
    }

    const query = `
      SELECT *
      FROM investors
      WHERE investor_id = $1
    `;

    const result = await db.query(query, [investor_id]);

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Investor Not Found"
      });
    }

    await redisClient.set(
      `investor_${investor_id}`,
      JSON.stringify(result.rows[0]),
      { EX: 3600 }
    );

    console.log("Investor stored in Redis..");

    return res.status(200).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error fetching investor details",
      error: error.message
    });
  }
};


// ======================================================
// GET INVESTOR HOLDINGS
// ======================================================

const getInvestorHoldings = async (req, res) => {
  try {

    const investor_id = req.params.investor_id;

    const cachedHoldings =
      await redisClient.get(`holdings_${investor_id}`);

    if (cachedHoldings) {

      console.log("Holdings fetched from Redis..");

      return res
        .status(200)
        .json(JSON.parse(cachedHoldings));
    }

    const query = `
      SELECT
          s.sip_id,

          mf.fund_name,

          mf.fund_type,

          s.sip_amount AS amount,

          s.start_date,

          s.sip_status AS status,

          COALESCE(
            SUM(si.units_allocated),
            0
          ) AS total_units,

          COALESCE(
            ROUND(
              SUM(si.units_allocated * si.nav_value),
              2
            ),
            0
          ) AS current_value

      FROM sips s

      LEFT JOIN sip_installments si
        ON s.sip_id = si.sip_id

      JOIN mutual_funds mf
        ON s.fund_id = mf.fund_id

      WHERE s.investor_id = $1

      GROUP BY
          s.sip_id,
          mf.fund_name,
          mf.fund_type,
          s.sip_amount,
          s.start_date,
          s.sip_status
    `;

    const result = await db.query(query, [investor_id]);

    await redisClient.set(
      `holdings_${investor_id}`,
      JSON.stringify(result.rows),
      { EX: 3600 }
    );

    console.log("Holdings stored in Redis..");

    return res.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error fetching holdings",
      error: error.message
    });
  }
};


// ======================================================
// GET INVESTOR NET WORTH
// ======================================================

const getInvestorNetWorth = async (req, res) => {
  try {

    const investor_id = req.params.investor_id;

    const cachedNetWorth =
      await redisClient.get(`networth_${investor_id}`);

    if (cachedNetWorth) {

      console.log("Net Worth fetched from Redis..");

      return res
        .status(200)
        .json(JSON.parse(cachedNetWorth));
    }

    const query = `
      SELECT
          COALESCE(
            ROUND(
              SUM(si.units_allocated * si.nav_value),
              2
            ),
            0
          ) AS total_net_worth

      FROM sip_installments si

      JOIN sips s
        ON si.sip_id = s.sip_id

      WHERE s.investor_id = $1
      AND si.transaction_status = 'SUCCESS'
    `;

    const result = await db.query(query, [investor_id]);

    const responseData = {
      totalNetWorth:
        result.rows[0]?.total_net_worth || 0
    };

    await redisClient.set(
      `networth_${investor_id}`,
      JSON.stringify(responseData),
      { EX: 3600 }
    );

    console.log("Net Worth stored in Redis..");

    return res.status(200).json(responseData);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error fetching net worth",
      error: error.message
    });
  }
};


// ======================================================
// GET INVESTOR TRANSACTIONS
// ======================================================

const getInvestorTransactions = async (req, res) => {
  try {

    const investor_id = req.params.investor_id;

    const query = `
      SELECT
          si.inst_id,

          mf.fund_name,

          si.amount,

          si.installment_date,

          si.transaction_status,

          si.nav_value,

          si.units_allocated

      FROM sip_installments si

      JOIN sips s
        ON si.sip_id = s.sip_id

      JOIN mutual_funds mf
        ON s.fund_id = mf.fund_id

      WHERE s.investor_id = $1

      ORDER BY si.installment_date DESC
    `;

    const result = await db.query(query, [investor_id]);

    return res.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error fetching transactions",
      error: error.message
    });
  }
};


// ======================================================
// GET RECENT PAYMENTS
// ======================================================

const getRecentPayments = async (req, res) => {
  try {

    const investor_id = req.params.investor_id;

    const query = `
      SELECT
          mf.fund_name AS "fundName",

          si.amount,

          si.installment_date AS "installmentDate",

          si.transaction_status AS "transactionStatus"

      FROM sip_installments si

      JOIN sips s
        ON si.sip_id = s.sip_id

      JOIN mutual_funds mf
        ON s.fund_id = mf.fund_id

      WHERE s.investor_id = $1

      ORDER BY si.installment_date DESC

      LIMIT 5
    `;

    const result = await db.query(query, [investor_id]);

    return res.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error fetching recent payments",
      error: error.message
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  displayInvestors,
  getInvestorById,
  getInvestorHoldings,
  getInvestorNetWorth,
  getInvestorTransactions,
  getRecentPayments
};