#!/bin/bash

# Directory to store the generated HTML files
output_dir="pages"
qr_code_dir="qr_code"

# Create the output directories if they don't exist
mkdir -p "$output_dir"
mkdir -p "$qr_code_dir"

# HTML template with a placeholder for pageIndex
html_template='<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Merry Christmas</title>
  <style>
    body {
      font-family: "Georgia", serif;
      background-color: #f2efe3;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 30px;
      background: #ffffff;
      border: 2px solid #d4af37;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    h1 {
      color: #b22222;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    p {
      color: #333333;
      font-size: 1.2em;
      line-height: 1.8em;
      text-align: left;
      margin: 20px 0;
    }
    .signature {
      margin-top: 30px;
      font-size: 1.5em;
      color: #006400;
      text-align: right;
    }
    .footer-link {
      text-align: center;
      margin-top: 20px;
    }
    .footer-link a {
      text-decoration: none;
      color: white;
      background-color: #b22222;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 1em;
      transition: background-color 0.3s ease;
    }
    .footer-link a:hover {
      background-color: #8b0000;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 id="receiver-name">Dear [Receiver]</h1>
    <p id="letter-content">
      As the snow blankets the world in white, and the soft glow of twinkling lights warms every corner, I wanted to take a moment to wish you a Merry Christmas.
    </p>
    <div class="signature" id="sender-name">
      [Sender]
    </div>
  </div>
  <script>
    async function fetchUpdatedContent(pageIndex) {
      try {
        const response = await fetch(`/api/get-content?pageIndex=${pageIndex}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          document.getElementById("receiver-name").textContent = `Dear ${data.content.receiver}`;
          document.getElementById("letter-content").textContent = data.content.content;
          document.getElementById("sender-name").innerHTML = `Warmest wishes,<br>${data.content.sender}`;
        } else {
          console.error("Error fetching content:", data.message);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    }
    const pageIndex = __PAGE_INDEX__;
    window.onload = () => fetchUpdatedContent(pageIndex);
    setInterval(() => fetchUpdatedContent(pageIndex), 10000);
  </script>
</body>
</html>
'

# Generate pages and QR codes
for i in {1..50}; do
  # Generate a random filename using the current index (i) as the seed
  filename=$(echo -n $i | openssl dgst -sha256 | awk '{print $2}' | head -c 8)
  
  # Replace the placeholder with the current pageIndex
  page_content="${html_template//__PAGE_INDEX__/$i}"
  
  # Output the HTML file with the generated filename
  echo "$page_content" > "$output_dir/${filename}.html"
  echo "Generated: $output_dir/${filename}.html"

  # Generate the QR code link for the page
  link="https://wlw2ltj.online/${filename}.html"
  qr_code="${qr_code_dir}/${filename}_qrcode.png"
  
  # Generate QR code
  qrencode -o "$qr_code" "$link"

  # Check if the QR code was generated successfully
  if [[ -f "$qr_code" ]]; then
    echo "QR code generated for ${link}: ${qr_code}"
  else
    echo "Failed to generate QR code for ${link}"
  fi
done

echo "All pages generated successfully in the '$output_dir' directory."
echo "All QR codes generated successfully in the '$qr_code_dir' directory."