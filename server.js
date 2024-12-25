const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // SQLite module

// HTTPS Configuration
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/wlw2ltj.online/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/wlw2ltj.online/fullchain.pem'),
};

// Initialize Express app
const app = express();
const pagesDir = path.join(__dirname, 'pages');

// Ensure directory exists
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
  console.log('Created pages directory');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(pagesDir));

// SQLite Database
const db = new sqlite3.Database('./pages.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
    createTablesIfNeeded();
  }
});

// Function to create tables if they don't exist
function createTablesIfNeeded() {
  db.run(`
    CREATE TABLE IF NOT EXISTS PageMetadata (
      pageIndex INTEGER PRIMARY KEY,
      filename TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating PageMetadata table:', err);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS PageStatus (
      pageIndex INTEGER PRIMARY KEY,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      content TEXT NOT NULL,
      status BOOLEAN DEFAULT 1
    )
  `, (err) => {
    if (err) console.error('Error creating PageStatus table:', err);
  });
}

// Update page content API
app.post('/api/update-page', (req, res) => {
  const { pageIndex, sender, receiver, content } = req.body;

  if (!pageIndex || !sender || !receiver || !content) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  db.get(`
    SELECT filename FROM PageMetadata WHERE pageIndex = ?`,
    [pageIndex], (err, row) => {
      if (err || !row) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      const filename = row.filename;
      const filePath = path.join(pagesDir, filename);

      const htmlContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Index: ${pageIndex} - Merry Christmas</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: url('christmas.jpg') no-repeat center center fixed; /* Background image */
      background-size: cover;
      font-family: "Arial", sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: white; /* Ensure text is readable on the background */
    }

    .mail-container {
      position: relative;
      width: 400px;
      height: 250px;
      perspective: 1000px;
      margin-bottom: 20px;
    }

    .mail {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      animation: openMail 2s forwards;
    }

    .envelope {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #fff;
      border: 2px solid #ccc;
      border-radius: 10px;
      backface-visibility: hidden;
    }

    .envelope-front {
      transform: rotateX(0deg);
      z-index: 2;
    }

    .envelope-back {
      transform: rotateX(180deg);
    }

    .message-container {
      display: none;
      width: 800px;
      background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent white */
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      padding: 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header {
      font-size: 36px;
      color: #e63946; /* A festive red color */
      margin-bottom: 10px;
      font-family: "Cursive", sans-serif;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .sender-receiver {
      margin-top: 20px;
      text-align: left;
      font-size: 18px;
      color: #333;
    }

    .sender-receiver div {
      margin-bottom: 10px;
    }

    .message-body {
      margin-top: 20px;
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 18px;
      line-height: 1.8;
      white-space: pre-wrap; /* Preserve line breaks */
      color: #2a2a2a;
    }

    @keyframes openMail {
      0% {
        transform: rotateX(0deg);
      }
      50% {
        transform: rotateX(90deg);
      }
      100% {
        transform: rotateX(180deg);
      }
    }
  </style>
</head>
<body>
  <!-- Mail Animation -->
  <div class="mail-container">
    <div class="mail">
      <div class="envelope envelope-front"></div>
      <div class="envelope envelope-back"></div>
    </div>
  </div>

  <!-- Message Content -->
  <div class="message-container" id="message-container">
    <div class="header">Merry Christmas</div>

    <!-- Sender and Receiver -->
    <div class="sender-receiver">
      <div><strong>From:</strong> <span id="sender">${sender}</span></div>
      <div><strong>To:</strong> <span id="receiver">${receiver}</span></div>
    </div>

    <!-- Message Body -->
    <div class="message-body" id="message-body">
      ${content}
    </div>
  </div>

  <script>
    // Show the content after the mail animation
    const messageContainer = document.getElementById('message-container');
    const mail = document.querySelector('.mail');

    mail.addEventListener('animationend', () => {
      const mailContainer = document.querySelector('.mail-container');
      mailContainer.style.display = 'none'; // Hide the envelope after the animation
      messageContainer.style.display = 'block'; // Show the message content
    });
  </script>
</body>
</html>
      `;

      fs.writeFileSync(filePath, htmlContent);

      db.run(`
        UPDATE PageStatus 
        SET sender = ?, receiver = ?, content = ?, status = 1 
        WHERE pageIndex = ?`,
        [sender, receiver, content, pageIndex], function (err) {
          if (err) {
            console.error('Error updating page status:', err);
            return res.status(500).json({ success: false, message: 'Error updating page status' });
          }

          res.json({ success: true, message: 'Page updated successfully' });
        });
    });
});

// Get all pages with their metadata and status
app.get('/api/get-all-pages', (req, res) => {
  db.all(`
    SELECT 
      PageMetadata.pageIndex, 
      PageMetadata.filename, 
      PageStatus.status 
    FROM PageMetadata 
    INNER JOIN PageStatus 
    ON PageMetadata.pageIndex = PageStatus.pageIndex
  `, (err, rows) => {
    if (err) {
      console.error('Error retrieving pages:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving pages' });
    }

    const pages = rows.map(row => ({
      pageIndex: row.pageIndex,
      pageAddress: `https://wlw2ltj.online/${row.filename}`,
      status: row.status ? '已使用' : '未使用'
    }));

    res.json({ success: true, pages });
  });
});

// Start HTTPS server
const PORT = 443;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running at https://wlw2ltj.online:${PORT}`);
});