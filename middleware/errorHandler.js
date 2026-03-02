const { constants } = require('../constants'); // Importing constants for HTTP status codes
// why next? The `next` parameter is a function that is used to pass control to the next middleware function
//  in the stack. In this case, it allows the error handler to be used as a middleware function 
// in the Express application, and it can be called to pass control to the next middleware function if needed.
//  This is important for handling errors properly
//  and ensuring that the application can continue to function even when an error occurs.

// why middleware? Middleware functions are functions that have access to the request object (req),
//  the response object (res), and the next middleware function in the application’s request-response cycle. 
// They can execute any code, make changes to the request and response objects, 
// end the request-response cycle, or call the next middleware function in the stack.
// In this case, the error handler is a middleware function that is used to handle errors 
// that occur in the application and send appropriate responses to the client.
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500; // If the response status code is already set, use it. Otherwise, default to 500 (Internal Server Error)
    switch (statusCode) {
        case constants.UNAUTHORIZED:
            res.status(statusCode).json({
                message: "Unauthorized access",
                error: err.message
            });
            break;
        case constants.FORBIDDEN:
            res.status(statusCode).json({
                message: "Forbidden access",
                error: err.message
            });
            break;
        case constants.NOT_FOUND:
            res.status(statusCode).json({
                message: "Resource not found",
                error: err.message
            });
            break;
        case constants.INTERNAL_SERVER_ERROR:
            res.status(statusCode).json({
                message: "Internal server error",
                error: err.message
            });
            break;
        default:
            res.status(statusCode).json({
                message: "Unknown error occurred",
                error: err.message
            });
    }
};
module.exports = errorHandler;