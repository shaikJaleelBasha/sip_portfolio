const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('C:/Users/DELL/Downloads/siptracker-db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;