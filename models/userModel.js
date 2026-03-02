const mongoose = require("mongoose"); // Import the mongoose library to interact with MongoDB

const userShcema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please provide a name for the user"],
    },
    email: {
      type: String,
      require: [true, "Please provide an email for the user"],
      unique: true, // Ensure that the email field is unique across all user documents in the database
    },
    password: {
      type: String,
      require: [true, "Please provide a password for the user"],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields to the user documents in the database
  },
);
module.exports = mongoose.model("User", userShcema); // Export the User model to be used in other parts of the application
