
const { Client } = require('pg');

require('dotenv').config();


const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
    client.connect()
  .then(() => console.log('Connected to Supabase local database'))
  .catch(err => console.error('Connection error', err.stack));

  const res = await client.query('SELECT * FROM investors;')
  console.log(res.rows)

  await client.end()
}

run()

module.exports = client;