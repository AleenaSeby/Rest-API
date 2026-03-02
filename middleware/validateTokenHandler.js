const asyncHandler = require('express-async-handler'); // Import the express-async-handler library to handle asynchronous errors in Express routes

const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library to handle JSON Web Tokens for authentication

const validateToken = asyncHandler(async (req, res, next) => {
    let token; // Declare a variable to hold the token
    let authHeader = req.headers.authorization || req.headers.Authorization; // Get the Authorization header from the request
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // Extract the token from the Authorization header
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // Verify the token using the JWT secret from the environment variables
            if (err) { // If there is an error verifying the token
                res.status(401); // Set the response status to 401 (Unauthorized)
                throw new Error("Not authorized, invalid token"); // Throw an error indicating that the token is invalid
            }
            console.log("Decoded token:", decoded); // Log the decoded token to the console for debugging purposes
            req.user = decoded; // Attach the decoded token (which contains the user's information) to the request object for use in subsequent middleware or route handlers
            next(); // Call the next middleware function in the stack
            if (!token) { // If no token is found in the Authorization header
                res.status(401); // Set the response status to 401 (Unauthorized)
                throw new Error("Not authorized, no token"); // Throw an error indicating that no token was provided
            }
        });
    }
});
module.exports = validateToken; // Export the validateToken middleware function to be used in other parts of the application