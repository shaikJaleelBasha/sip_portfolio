const pool = require('./poolManager.js');

async function testProcessSip() {
  const sipId = 1; // Assuming SIP ID 1 exists
  const client = await pool.connect();
  
  try {
      await client.query("BEGIN");

      // 1. Get SIP
      const sipRes = await client.query(`SELECT * FROM sips WHERE sip_id = $1`, [sipId]);
      const sip = sipRes.rows[0];
      
      if (!sip) {
          console.log("SIP not found");
          return;
      }

      console.log("Found SIP:", sip);

      // 2. Get latest NAV
      const navRes = await client.query(`
          SELECT * FROM fund_nav_history 
          WHERE fund_id = $1 
          ORDER BY nav_date DESC 
          LIMIT 1
      `, [sip.fund_id]);
      
      const nav = navRes.rows[0];
      if (!nav) {
          console.log("Error fetching NAV");
          return;
      }

      console.log("Found NAV:", nav);

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
      console.log("Inserted Installment:", dbInstallmentId);

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

      console.log("Transaction created successfully");
      await client.query("ROLLBACK"); // Rollback so we don't pollute DB

  } catch (err) {
      console.error("DB Error:", err);
      await client.query("ROLLBACK");
  } finally {
      client.release();
      process.exit(0);
  }
}

testProcessSip();
