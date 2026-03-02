const asyncHandler = require('express-async-handler'); 
const bcrypt = require('bcrypt'); // Import the bcryptjs library to hash passwords and compare hashed passwords
const User = require('../models/userModel'); // Import the User model to interact with the users collection in the database
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library to create and verify JSON Web Tokens (JWTs) for authentication
//@desc    Register a new user
//@route   POST /api/users/register
//@access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body; // Destructure the name, email, and password properties from the request body
    if (!name || !email || !password) { // Check if any of the required fields are missing
        res.status(400); // Set the response status to 400 (Bad Request)
        throw new Error("Please provide name, email, and password"); // If any of the required fields are missing, throw an error with a message
    }
    const userAvailable = await User.findOne({ email }); // Use the User model to check if a user with the provided email already exists in the database
    if (userAvailable) { // If a user with the provided email already exists
        res.status(400); // Set the response status to 400 (Bad Request)
        throw new Error("User already exists"); // Throw an error with a message indicating that the user already exists
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the provided password using bcrypt with a salt rounds of 10
    const user = await User.create({ name, email, password: hashedPassword });
    if (user) { // If the user was successfully created in the database
        res.status(201).json({ _id: user._id, email: user.email }); // Send a JSON response with the user's ID and email, and a status of 201 (Created)
    } else { // If there was an issue creating the user in the database
        res.status(400); // Set the response status to 400 (Bad Request)
        throw new Error("Invalid user data"); // Throw an error with a message indicating that the user data was invalid
    }
    // res.status(200).json({message: "Register a new user", user});
})
// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body; // Destructure the email and password properties from the request body
    if (!email || !password) { // Check if either the email or password is missing
        res.status(400); // Set the response status to 400 (Bad Request)
        throw new Error("Please provide email and password"); // If either the email or password is missing, throw an error with a message
    }
    const user = await User.findOne({ email }); // Use the User model to find a user with the provided email in the database
    if (user && (await bcrypt.compare(password, user.password))) { // If a user with the provided email is found and the provided password matches the hashed password in the database
        const accessToken = jwt.sign( // Create a JSON Web Token (JWT) for the authenticated user
            { userId: user._id, email: user.email }, // Include the user's ID and email in the token payload
            process.env.JWT_SECRET, // Use the JWT secret from the environment variables to sign the token
            { expiresIn: "1h" } // Set the token to expire in 1 hour
        );
        res.status(200).json({ accessToken }); // Send a JSON response with the generated token and a status of 200 (OK)
    }
    else {
        res.status(401); // Set the response status to 401 (Unauthorized)
        throw new Error("Invalid email or password"); // If the email is not found or the password does not match, throw an error with a message indicating that the email or password is invalid
    }
    // res.status(200).json({message: "Login a user"});
})
// @desc    Get current user
// @route   GET /api/users/current
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json({message: "Get current user", user: req.user}); // Send a JSON response with a message and the user's information (which is attached to the request object by the validateToken middleware) with a status of 200 (OK)
})
module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
}