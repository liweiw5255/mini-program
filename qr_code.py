import sqlite3
import qrcode
from PIL import Image

# Database path (ensure this is correct)
db_path = './pages.db'

# Open SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Retrieve all filenames sorted by pageIndex
cursor.execute("SELECT pageIndex, filename FROM PageMetadata ORDER BY pageIndex")
rows = cursor.fetchall()

# Base domain URL
base_url = "https://wlw2ltj.online/"

# Directory to save QR codes
qr_code_directory = './qr_codes/'

# Create a directory for QR codes if it doesn't exist
import os
if not os.path.exists(qr_code_directory):
    os.makedirs(qr_code_directory)

# Process each row
for row in rows:
    page_index = row[0]
    filename = row[1]
    
    # Construct the URL
    url = f"{base_url}{filename}"
    
    # Generate QR code for the URL
    qr = qrcode.make(url)
    
    # Save QR code as an image
    qr_code_path = os.path.join(qr_code_directory, f"qr_code_{page_index}.png")
    qr.save(qr_code_path)
    
    # Print the filename and URL with QR code
    print(f"PageIndex: {page_index}, Filename: {filename}, URL: {url}")
    print(f"QR Code saved to: {qr_code_path}")

# Close the database connection
conn.close()

print("QR codes generation completed.")