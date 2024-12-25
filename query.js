const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./pages.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error('Error opening database:', err.message);
  }
  console.log('Connected to the SQLite database.');
});


// Query all data from PageMetadata table
db.all('SELECT * FROM PageMetadata', (err, rows) => {
  if (err) {
    console.error('Error querying PageMetadata:', err.message);
  } else {
    console.log('PageMetadata data:');
    console.table(rows); // Display data in tabular format
  }
});

// Query all data from PageStatus table
db.all('SELECT * FROM PageStatus', (err, rows) => {
  if (err) {
    console.error('Error querying PageStatus:', err.message);
  } else {
    console.log('PageStatus data:');
    console.table(rows); // Display data in tabular format
  }
});

// Close the database when done
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Closed the SQLite database.');
  }
});