const {Client} = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
})

async function run() {
    try {
        await client.connect();
        console.log("Connected to POSTGRE.. ->SUPABASE");
        const res = await client.query(`SELECT * FROM investors;`);
        console.log(res.rows);
    } catch (error) {
        console.log("Database Error: ");
        console.log(error);
    }
}

run()
module.exports = client;