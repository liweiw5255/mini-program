import pymongo

# MongoDB URI (change this if you're using MongoDB Atlas or a different connection)
mongo_uri = "mongodb://localhost:27017/"

# Connect to MongoDB
client = pymongo.MongoClient(mongo_uri)

# Select your database
db = client["pagesDB"]

# Define collections (schemas) in Python
# PageMetadata collection: Stores pageIndex and filename
page_metadata_collection = db["PageMetadata"]

# PageStatus collection: Stores pageIndex, sender, receiver, content, and status
page_status_collection = db["PageStatus"]

# Sample Data for PageMetadata
page_metadata = {
    "pageIndex": 1,
    "filename": "a1b2c3d4e5f6g7h8.html"
}

# Sample Data for PageStatus
page_status = {
    "pageIndex": 1,
    "sender": "Sender 1",
    "receiver": "Receiver 1",
    "content": "This is the content of page 1.",
    "status": True
}

# Insert sample data into collections
page_metadata_collection.insert_one(page_metadata)
page_status_collection.insert_one(page_status)

print("Collections and sample documents created!")