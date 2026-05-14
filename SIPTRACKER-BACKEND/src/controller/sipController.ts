import { Request, Response } from "express";
import pool from "../poolManager";

const createSIP = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sipId,
      investorId,
      fundId,
      sipAmount,
      sipDate,
      startDate,
      endDate,
      sipStatus,
    } = req.body;

    let portRes = await pool.query(
      "SELECT portfolio_id FROM portfolios WHERE investor_id = $1",
      [investorId],
    );
    let portfolioId: number;

    if (portRes.rows.length === 0) {
      const newPortRes = await pool.query(
        "INSERT INTO portfolios (investor_id) VALUES ($1) RETURNING portfolio_id",
        [investorId],
      );
      portfolioId = newPortRes.rows[0].portfolio_id;
    } else {
      portfolioId = portRes.rows[0].portfolio_id;
    }

    let query: string;
    let values: any[];

    if (sipId) {
      query = `
        INSERT INTO sips 
        (sip_id, investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING sip_id
      `;
      values = [
        sipId,
        investorId,
        portfolioId,
        fundId,
        sipAmount,
        sipDate,
        startDate,
        endDate,
        sipStatus,
      ];
    } else {
      query = `
        INSERT INTO sips 
        (investor_id, portfolio_id, fund_id, sip_amount, sip_date, start_date, end_date, sip_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING sip_id
      `;
      values = [
        investorId,
        portfolioId,
        fundId,
        sipAmount,
        sipDate,
        startDate,
        endDate,
        sipStatus,
      ];
    }

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "SIP created successfully",
      sipId: result.rows[0].sip_id,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error creating SIP" });
  }
};

const getSipById = async (req: Request, res: Response): Promise<void> => {
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
      res.status(404).json({ message: "SIP not found" });
      return;
    }

    res.json({
      sipId: row.sip_id,
      investorId: row.investor_id,
      portfolioId: row.portfolio_id,
      fundId: row.fund_id,
      sipAmount: row.sip_amount,
      sipDate: row.sip_date,
      startDate: row.start_date,
      endDate: row.end_date,
      sipStatus: row.sip_status,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error fetching SIP details" });
  }
};

const processSips = async (req: Request, res: Response): Promise<void> => {
  const { sipId } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sipRes = await client.query(`SELECT * FROM sips WHERE sip_id = $1`, [
      sipId,
    ]);
    const sip = sipRes.rows[0];

    if (!sip) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "SIP not found" });
      return;
    }

    const navRes = await client.query(
      `
      SELECT * FROM fund_nav_history 
      WHERE fund_id = $1 
      ORDER BY nav_date DESC 
      LIMIT 1
    `,
      [sip.fund_id],
    );

    const nav = navRes.rows[0];
    if (!nav) {
      await client.query("ROLLBACK");
      res.status(500).json({ message: "Error fetching NAV" });
      return;
    }

    const units = sip.sip_amount / nav.nav_value;

    const installRes = await client.query(
      `
      INSERT INTO sip_installments
      (sip_id, installment_date, amount, nav_value, units_allocated, transaction_status)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
      RETURNING inst_id
    `,
      [sip.sip_id, sip.sip_amount, nav.nav_value, units, "SUCCESS"],
    );

    const dbInstallmentId = installRes.rows[0].inst_id;

    await client.query(
      `
      INSERT INTO investment_transactions
      (investor_id, portfolio_id, fund_id, installment_id, transaction_type, transaction_amount, nav_value, units, transaction_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
    `,
      [
        sip.investor_id,
        sip.portfolio_id,
        sip.fund_id,
        dbInstallmentId,
        "BUY",
        sip.sip_amount,
        nav.nav_value,
        units,
      ],
    );

    await client.query("COMMIT");

    res.json({
      message: "SIP processed successfully",
      installmentId: dbInstallmentId,
      units,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Transaction error" });
  } finally {
    client.release();
  }
};

const getSIPTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    const response = result.rows.map((r: any) => ({
      transactionId: r.transaction_id,
      fundName: r.fund_name,
      transactionType: r.transaction_type,
      transactionAmount: r.transaction_amount,
      navValue: r.nav_value,
      units: r.units,
      transactionDate: r.transaction_date,
    }));

    res.json(response);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

export { createSIP, getSipById, processSips, getSIPTransactions };
