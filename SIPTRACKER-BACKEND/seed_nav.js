const pool = require('./poolManager.js');

async function seedNavs() {
  const client = await pool.connect();
  try {
    const fundsRes = await client.query('SELECT fund_id FROM mutual_funds');
    const funds = fundsRes.rows;

    for (let fund of funds) {
      const navRes = await client.query('SELECT * FROM fund_nav_history WHERE fund_id = $1', [fund.fund_id]);
      if (navRes.rows.length === 0) {
        const randomNav = (Math.random() * 100 + 50).toFixed(4);
        await client.query(
          'INSERT INTO fund_nav_history (fund_id, nav_value, nav_date) VALUES ($1, $2, CURRENT_DATE)',
          [fund.fund_id, randomNav]
        );
        console.log(`Seeded fund ${fund.fund_id} with NAV ${randomNav}`);
      }
    }
    console.log('Seed complete.');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedNavs();
