require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    console.log("SUCCESS: MongoDB Connected successfully!");
    
    // Check which database we are connected to
    const db = client.db();
    console.log("Database name:", db.databaseName);
    
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("CONNECTION FAILED:", err.message);
    if (err.message.includes("authentication failed")) {
      console.log("TIP: Make sure your password in .env is correct (special characters might need escaping).");
    }
    process.exit(1);
  }
}

connectDB();
