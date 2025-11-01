// ============================================================================
// Import the Mongoose library
// ----------------------------------------------------------------------------
// Mongoose is a popular Node.js library that provides an easy way to interact
// with MongoDB databases. It allows developers to define schemas (blueprints)
// for their data and automatically handles the creation, validation, and
// querying of MongoDB documents using those schemas.
// ============================================================================
const mongoose = require("mongoose");


// ============================================================================
// Define the User Schema
// ----------------------------------------------------------------------------
// A "Schema" in Mongoose defines the structure of the documents that will be
// stored inside a MongoDB collection. It acts as a *blueprint* for your data,
// enforcing consistency and adding useful features like validation,
// default values, and type checking.
//
// Below, we define what a "User" document should look like.
// ============================================================================
const userSchema = new mongoose.Schema({
  // ---------------------------------------------------------
  // Field: name
  // ---------------------------------------------------------
  // This field represents the user's name.
  //
  // - `type: String` means this field must hold a text value.
  // - `required: true` means every user document must have a name
  //   or else Mongoose will throw a validation error when trying
  //   to save it to the database.
  //
  // Example document:
  //   { "_id": "66fa3...", "name": "Eddie" }
  // ---------------------------------------------------------
  name: { type: String, required: true },
});


// ============================================================================
// Create and Export the Mongoose Model
// ----------------------------------------------------------------------------
// In Mongoose, a "model" is a compiled version of the schema. It acts as an
// interface to the MongoDB collection, giving us access to functions such as:
//
//   - `.find()`       → Retrieve documents
//   - `.findById()`   → Retrieve a single document by its unique ID
//   - `.save()`       → Save a new document
//   - `.findByIdAndUpdate()` / `.findByIdAndDelete()`
//                      → Modify or remove documents
//
// The syntax:
//   mongoose.model("User", userSchema)
//
// 1. Creates (or reuses) a collection in MongoDB named "users".
//    - Mongoose automatically pluralizes the model name ("User" → "users").
// 2. Connects the schema definition (`userSchema`) to that collection.
// 3. Returns a model object which you can use throughout your app.
//
// By exporting it with `module.exports`, other files (like `server.js`)
// can import it and perform database operations like:
//   const User = require("./models/User");
//   const users = await User.find();
// ============================================================================
module.exports = mongoose.model("User", userSchema);