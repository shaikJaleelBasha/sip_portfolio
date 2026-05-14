const pool = require('./poolManager.js'); 
pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'").then(res => {
  console.log(res.rows);
  process.exit(0);
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});
