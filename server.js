const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const N = 100;

// Initialize the array with default objects
const updatedContent = Array.from({ length: N }, () => ({
  receiver: '[Receiver]',
  sender: '[Sender]',
  content: '[Content]',
  image: '[Image]',
  status: false
}));

const app = express();
const pagesDir = path.join(__dirname, 'pages');

// Ensure the `pagesDir` directory exists
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
  console.log('Created pages directory');
}

// Middlewares
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse application/json requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
app.use(express.text()); // Parse text/plain requests

// HTTPS Configuration
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/wlw2ltj.online/privkey.pem'), // Private key
  cert: fs.readFileSync('/etc/letsencrypt/live/wlw2ltj.online/fullchain.pem'), // Fullchain certificate
};

// Serve static files from the `pages` directory
app.use(express.static(pagesDir));

// Root route for serving `index.html`
app.get('/', (req, res) => {
  const indexPath = path.join(pagesDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Homepage not found. Please ensure index.html exists in the pages directory.');
  }
});

// Endpoint for updating page content
app.post('/api/update-page', (req, res) => {

  // Destructure the JSON body
  const {pageIndex, sender, receiver, content, image } = req.body;

  // Validate required fields
  if (!pageIndex || !sender || !receiver || !content) {
    return res.status(400).json({ success: false, message: 'Missing required fields: pageInde, Sender, Receiver, Content' });
  }

  try {
    // Construct file name and path
    const fileName = '/page' + pageIndex + '.html';
    const filePath = path.join(pagesDir, fileName);
    console.log(`Page updated: ${filePath}`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Page does not exist' });
    }
    const index = parseInt(pageIndex, 10);

    // Update the server-side content
    updatedContent[index].receiver = receiver;
    updatedContent[index].sender = sender;
    updatedContent[index].content = content;
    updatedContent[index].image = image;
    updatedContent[index].status = true;

    // Return success response
    res.json({ success: true, message: 'Page content updated successfully' });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Serve the updated content for a specific page index
app.get('/api/get-content', (req, res) => {
  const { pageIndex } = req.query; // Extract the pageIndex parameter

  // Validate that pageIndex is provided
  if (!pageIndex) {
    return res.status(400).json({ success: false, message: 'Missing pageIndex parameter' });
  }

  // Convert pageIndex to a zero-based index
  const index = parseInt(pageIndex, 10);

  // Validate that index is within bounds and not null/undefined
  if (isNaN(index) || index <= 0 || index >= updatedContent.length || !updatedContent[index]) {
    return res.status(404).json({ success: false, message: 'Content not found for this page index' });
  }

  // Retrieve the content
  const content = updatedContent[index];

  // Respond with the content
  res.json({ success: true, content });
});


// Endpoint to get all content
app.get('/api/get-all-content', (req, res) => {
  try {
    res.json({ success: true, contents: updatedContent });
  } catch (error) {
    console.error('Error fetching all content:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// HTTPS Server
const PORT = 443;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running at https://wlw2ltj.online:${PORT}`);
});