const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Directory where the HTML files are stored
const pagesDir = path.join(__dirname, 'pages');

// Open the SQLite database
const db = new sqlite3.Database('./pages.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error('Error opening database:', err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Update all statuses to 0
db.run('UPDATE PageStatus SET status = 0', function (err) {
  if (err) {
    console.error('Error updating status:', err.message);
  } else {
    console.log(`Updated ${this.changes} rows to set status = 0.`);
  }
});


// Retrieve all filenames by page index and update HTML files
db.all('SELECT * FROM PageMetadata', (err, rows) => {
  if (err) {
    console.error('Error querying PageMetadata:', err.message);
    return;
  }

  rows.forEach((row) => {
    const { pageIndex, filename } = row;

    // Path to the HTML file
    const filePath = path.join(pagesDir, filename);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Read the existing content of the HTML file
      const content = fs.readFileSync(filePath, 'utf-8');

      // Update the title with the page index
      const updatedContent = 

      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>写下你想对他或她说的话</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: url('christmas.jpg') no-repeat center center fixed; /* Replace with actual URL */
            background-size: cover;
            font-family: "Arial", sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
          }
      
          .form-container {
            width: 600px;
            background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent white */
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            padding: 20px;
            text-align: center;
          }
      
          .form-title {
            font-size: 36px;
            color: #e63946;
            margin-bottom: 20px;
            font-family: "Cursive", sans-serif;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
      
          .form-group {
            margin-bottom: 20px;
            text-align: left;
          }
      
          .form-group label {
            font-size: 18px;
            color: #333;
            margin-bottom: 5px;
            display: block;
          }
      
          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-top: 5px;
          }
      
          .form-group textarea {
            resize: none;
            height: 100px;
          }
      
          .submit-btn {
            width: 100%;
            padding: 15px;
            background-color: #28a745;
            color: white;
            font-size: 18px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
      
          .submit-btn:hover {
            background-color: #218838;
          }
      
          .error-message, .success-message {
            margin-top: 20px;
            font-size: 18px;
          }
      
          .error-message {
            color: #dc3545;
          }
      
          .success-message {
            color: #28a745;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <div class="form-title">Merry Christmas</div>
          <form id="christmasForm">
            <div class="form-group">
              <label for="sender">您是：</label>
              <input type="text" id="sender" name="sender" placeholder="请输入您的名字" required>
            </div>
            <div class="form-group">
              <label for="receiver">你想写给谁：</label>
              <input type="text" id="receiver" name="receiver" placeholder="请输入收信人的名字" required>
            </div>
            <div class="form-group">
              <label for="content">你的留言内容是：</label>
              <textarea id="content" name="content" placeholder="请输入您的留言内容" required></textarea>
            </div>
            <button type="button" class="submit-btn" onclick="submitForm()">提交</button>
          </form>
          <div id="successMessage" class="success-message" style="display: none;">提交成功！</div>
          <div id="errorMessage" class="error-message" style="display: none;">无法连接服务器，请稍后再试！</div>
        </div>
      
        <script>
          async function submitForm() {
            const sender = document.getElementById('sender').value;
            const receiver = document.getElementById('receiver').value;
            const content = document.getElementById('content').value;
            const filename = window.location.pathname.split('/').pop(); // Get filename from URL
            const pageIndex = ${pageIndex};
      
            if (!sender || !receiver || !content) {
              alert('请填写所有字段！');
              return;
            }
      
            try {
              const response = await fetch('https://wlw2ltj.online/api/update-page', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*'
                },
                body: JSON.stringify({
                  pageIndex,
                  sender,
                  receiver,
                  content
                })
              });
      
              const result = await response.json();
              if (result.success) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').style.display = 'none';
              } else {
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('errorMessage').textContent = '提交失败，请重试！';
              }
            } catch (error) {
              console.error('Error submitting form:', error);
              document.getElementById('successMessage').style.display = 'none';
              document.getElementById('errorMessage').style.display = 'block';
            }
          }
        </script>
      </body>
      </html>`
     
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`Updated HTML file for Page Index ${pageIndex}: ${filename}`);
    } else {
      console.warn(`HTML file not found for Page Index ${pageIndex}: ${filename}`);
    }
  });
});

// Close the database when done
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Closed the SQLite database.');
  }
});