// ============================================================================
// Import the Mongoose library
// ----------------------------------------------------------------------------
// Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
// It allows us to define schemas and models for our MongoDB collections,
// providing structure, validation, and convenient query methods.
// ============================================================================
const mongoose = require("mongoose");


// ============================================================================
// Define the Transaction Schema
// ----------------------------------------------------------------------------
// A "Schema" in Mongoose defines the structure of the documents that will be
// stored in a MongoDB collection. It specifies what fields exist, their data
// types, and any validation rules or default values.
// ============================================================================

// Create a new schema for transactions
const transactionSchema = new mongoose.Schema({
  // ---------------------------------------------------------
  // Field: type
  // ---------------------------------------------------------
  // This field represents the kind of transaction performed.
  // The `type` field itself is an object where:
  //   - `type: String` specifies that the data type is a string.
  //   - `enum` defines an allowed set of values; in this case,
  //       the transaction can only be either "deposit" or "withdrawal".
  //   - `required: true` means that the field must be provided.
  // ---------------------------------------------------------
  type: {
    type: String, // data type for this field is a string
    enum: ["deposit", "withdrawal"], // only these two values are valid
    required: true, // must be included when creating a transaction
  },

  // ---------------------------------------------------------
  // Field: amount
  // ---------------------------------------------------------
  // This represents how much money was deposited or withdrawn.
  //   - `type: Number` means this must be a numerical value.
  //   - `required: true` ensures that every transaction has an amount.
  // ---------------------------------------------------------
  amount: { type: Number, required: true },

  // ---------------------------------------------------------
  // Field: date
  // ---------------------------------------------------------
  // This stores the exact date and time when the transaction occurred.
  //   - `type: Date` means it will store a JavaScript Date object.
  //   - `default: Date.now` sets a default value to the current date/time
  //     when the transaction is created (if no date is explicitly provided).
  // ---------------------------------------------------------
  date: { type: Date, default: Date.now },
});


// ============================================================================
// Export the Transaction Model
// ----------------------------------------------------------------------------
// In Mongoose, a "model" is a wrapper around a schema that provides an
// interface for interacting with the corresponding MongoDB collection.
//
// The syntax `mongoose.model("Transaction", transactionSchema)` does two things:
//   1. Creates (or references) a collection named "transactions" in MongoDB.
//      - Mongoose automatically converts "Transaction" → lowercase plural ("transactions").
//   2. Attaches the defined schema to that collection, enabling us to perform
//      CRUD operations like `find()`, `save()`, `deleteOne()`, etc.
//
// We then export this model so it can be imported and used in other files,
// such as `server.js`.
// ============================================================================
module.exports = mongoose.model("Transaction", transactionSchema);