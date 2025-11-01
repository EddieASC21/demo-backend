/*
====================================================================================
  BACKEND DEMO — Express + MongoDB
------------------------------------------------------------------------------------
This file is the main entry point for your backend server. It does the following:
  ✅ Loads environment variables (like PORT and MongoDB URI)
  ✅ Connects to a MongoDB database using Mongoose
  ✅ Defines RESTful API routes for Users and Bank Transactions
  ✅ Starts an Express server to listen for incoming HTTP requests
====================================================================================
*/


// ============================================================================
// 1. LOAD REQUIRED DEPENDENCIES
// ----------------------------------------------------------------------------
// These are the main Node.js modules your app depends on:
// - dotenv: loads variables from a .env file (like database credentials)
// - express: the web framework that handles routing and HTTP requests
// - mongoose: used to connect to and interact with MongoDB
// ============================================================================
require("dotenv").config();  // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");


// ============================================================================
// 2. INITIALIZE EXPRESS APPLICATION
// ----------------------------------------------------------------------------
// Here, we create an instance of an Express application which will serve as
// our backend server. We also define a PORT for the server to listen on.
// The port is either taken from .env (for production) or defaults to 3000.
// ============================================================================
const app = express();
const PORT = process.env.PORT || 3000;


// ============================================================================
// 3. SETUP MIDDLEWARE
// ----------------------------------------------------------------------------
// Middleware are functions that run before your route handlers.
// `express.json()` allows the server to automatically parse JSON data sent
// in the request body (for example, when a client sends { "name": "Eddie" }).
// ============================================================================
app.use(express.json());


// ============================================================================
// 4. CONNECT TO MONGODB USING MONGOOSE
// ----------------------------------------------------------------------------
// Mongoose handles the actual connection to MongoDB. The URI is stored
// in an environment variable named MONGO_URI (from your .env file).
// - If successful, it logs a green checkmark message.
// - If it fails, it catches and logs an error message instead.
// ============================================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));


// ============================================================================
// 5. IMPORT MODELS
// ----------------------------------------------------------------------------
// These are your Mongoose models, which represent MongoDB collections.
// - User → "users" collection
// - Transaction → "transactions" collection
// Each model gives access to CRUD methods like find(), save(), deleteMany(), etc.
// ============================================================================
const User = require("./models/User");
const Transaction = require("./models/Transaction");


// ============================================================================
// 6. ROOT ENDPOINT
// ----------------------------------------------------------------------------
// A simple route for the base URL (http://localhost:3000/).
// It helps verify that your backend server is running correctly.
// ============================================================================
app.get("/", (req, res) => {
  res.send("Welcome to the backend! 🚀");
});


// ============================================================================
// 7. USERS API
// ----------------------------------------------------------------------------
// This section defines all endpoints related to users.
//
// RESTful routes:
//   GET    /users        → get all users
//   GET    /users/:id    → get a single user by ID
//   POST   /users        → create a new user
//   PUT    /users/:id    → update user data
//   DELETE /users/:id    → delete a user
// ============================================================================

// ---------------------------------------------------------
// GET /users
// Retrieve all users from the database.
// ---------------------------------------------------------
app.get("/users", async (req, res) => {
  const users = await User.find();     // Fetch all users from MongoDB
  res.json(users);                     // Respond with JSON array
});

// ---------------------------------------------------------
// GET /users/:id
// Retrieve a single user by their MongoDB ObjectId.
// - req.params.id reads the "id" part from the URL.
// - If not found, returns a 404 status and an error message.
// ---------------------------------------------------------
app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ---------------------------------------------------------
// POST /users
// Create a new user in the database.
// - Reads the JSON body (req.body.name) and constructs a new user.
// - Calls .save() to persist it to MongoDB.
// - Returns the newly created user with status 201 (Created).
// ---------------------------------------------------------
app.post("/users", async (req, res) => {
  const user = new User({ name: req.body.name });
  await user.save();                   // Insert new user document
  res.status(201).json(user);          // Send the saved user back
});

// ---------------------------------------------------------
// PUT /users/:id
// Update an existing user by ID.
// - Finds the user and updates its "name" field.
// - The { new: true } option makes Mongoose return the updated document.
// ---------------------------------------------------------
app.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }                      // Return the updated user instead of old
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ---------------------------------------------------------
// DELETE /users/:id
// Delete a user by their ID.
// - Uses findByIdAndDelete() to remove the record.
// - Returns a success message if the user existed.
// ---------------------------------------------------------
app.delete("/users/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ message: "User deleted" });
});


// ============================================================================
// 8. BANK API
// ----------------------------------------------------------------------------
// These endpoints simulate simple banking operations using MongoDB to store
// transactions. Instead of an actual balance field, the balance is calculated
// dynamically by summing deposits and subtracting withdrawals.
//
// RESTful routes:
//   GET    /balance        → calculate current balance
//   POST   /deposit        → add a deposit transaction
//   POST   /withdraw       → withdraw money if sufficient balance
//   GET    /transactions   → get all past transactions
//   DELETE /transactions   → clear all transaction records
// ============================================================================

// ---------------------------------------------------------
// GET /balance
// Computes current balance by aggregating all transactions.
// - Deposits add to balance.
// - Withdrawals subtract from balance.
// - Uses MongoDB aggregation pipeline to sum values.
// ---------------------------------------------------------
app.get("/balance", async (req, res) => {
  // Calculate total deposits
  const deposits = await Transaction.aggregate([
    { $match: { type: "deposit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Calculate total withdrawals
  const withdrawals = await Transaction.aggregate([
    { $match: { type: "withdrawal" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Use optional chaining to handle empty arrays
  const totalDeposits = deposits[0]?.total || 0;
  const totalWithdrawals = withdrawals[0]?.total || 0;

  // Calculate net balance
  const balance = totalDeposits - totalWithdrawals;

  res.json({ balance });
});

// ---------------------------------------------------------
// POST /deposit
// Adds a deposit transaction to the database.
// - Validates that "amount" is a positive number.
// - Creates a new Transaction document with type = "deposit".
// ---------------------------------------------------------
app.post("/deposit", async (req, res) => {
  const amount = req.body.amount;

  // Validate amount
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid deposit amount" });
  }

  // Create and save a new transaction
  const transaction = new Transaction({ type: "deposit", amount });
  await transaction.save();

  res.json({ message: `Deposited $${amount}` });
});

// ---------------------------------------------------------
// POST /withdraw
// Withdraws money from the account if balance allows.
// - Recalculates the balance in real time using aggregation.
// - If the requested withdrawal exceeds the balance, it fails.
// ---------------------------------------------------------
app.post("/withdraw", async (req, res) => {
  const amount = req.body.amount;

  // Validate input amount
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  // Compute current balance dynamically
  const currentBalance = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        balance: {
          // $cond lets us add for deposits and subtract for withdrawals
          $sum: {
            $cond: [
              { $eq: ["$type", "deposit"] },
              "$amount",
              { $multiply: ["$amount", -1] },
            ],
          },
        },
      },
    },
  ]);

  const balance = currentBalance[0]?.balance || 0;

  // Reject withdrawal if insufficient funds
  if (amount > balance) {
    return res.status(400).json({ error: "Insufficient funds" });
  }

  // Otherwise, record the withdrawal
  const transaction = new Transaction({ type: "withdrawal", amount });
  await transaction.save();

  res.json({ message: `Withdrew $${amount}` });
});

// ---------------------------------------------------------
// GET /transactions
// Fetches a list of all transactions from newest to oldest.
// - .sort({ date: -1 }) sorts results in descending order by date.
// ---------------------------------------------------------
app.get("/transactions", async (req, res) => {
  const transactions = await Transaction.find().sort({ date: -1 });
  res.json(transactions);
});

// ---------------------------------------------------------
// DELETE /transactions
// Clears all transaction records in the database.
// - deleteMany({}) deletes every document in the collection.
// ---------------------------------------------------------
app.delete("/transactions", async (req, res) => {
  await Transaction.deleteMany({});
  res.json({ message: "All transactions cleared." });
});


// ============================================================================
// 9. START THE SERVER
// ----------------------------------------------------------------------------
// Finally, we tell Express to start listening for incoming HTTP requests
// on the specified port. Once the server is running, it logs a success message
// with the full localhost URL (e.g., http://localhost:3000).
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});