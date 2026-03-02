const express = require("express"); // Import the Express library to create an Express application
const router = express.Router(); // Create a new router object to define routes for the application
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/userController");
// Import the user controller functions to handle user-related routes
const validateToken = require("../middleware/validateTokenHandler"); // Import the validateToken middleware to protect routes that require authentication

// Define routes for user registration, login, and getting the current user
router.post("/register", registerUser); // Use the registerUser function from the userControllers.js file to handle POST requests to the /api/users/register path
router.post("/login", loginUser); // Use the loginUser function from the userControllers.js file to handle POST requests to the /api/users/login path
router.get("/current", validateToken, getCurrentUser); // Use the getCurrentUser function from the userControllers.js file to handle GET requests to the /api/users/current path

// router.post('/register', (req, res) => {
//     res.status(200).json({message: "Register a new user"});
// });
// router.post('/login', (req, res) => {
//     res.status(200).json({message: "Login a user"});
// });
// router.get('/current', (req, res) => {
//     res.status(200).json({message: "Get current user"});
// });

module.exports = router; // Export the router object to be used in other parts of the application
