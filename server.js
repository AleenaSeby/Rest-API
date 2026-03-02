const express = require('express'); // Import the Express library
const app = express(); // Create an instance of the Express application
const dotenv = require('dotenv'); // Import the dotenv library to load environment variables from a .env file
const errorHandler = require('./middleware/errorHandler');
dotenv.config(); // Load environment variables from the .env file
const connectDB = require('./config/dbConnection'); // Import the function to connect to the MongoDB database
connectDB(); // Connect to the MongoDB database

const PORT = process.env.PORT || 3000;
// listen takes 2 arguments: the port number and a callback function that runs when the server starts successfully
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 2 arguments: the path and a callback function that runs when a request is made to that path
// app.get('/api/contacts', (req, res) => {
//     // res.json({message: "Get all contacts"});
//      res.status(200).json({message: "Get all contacts"});
// })
app.use(express.json()); // Middleware to parse JSON bodies of incoming requests.
// client will send a JSON object in the body of the request, 
// and this middleware will parse it and make it available in req.body
// server can access the data sent by the client in the request body using req.body,
//  which will contain the parsed JSON object. 
// This is essential for handling POST and PUT requests where the client sends data to the server.

app.use(errorHandler); // Use the errorHandler middleware to handle errors in the application
// `use` is a middleware function that runs for every request to the specified path, in this case /api/contacts
app.use('/api/contacts', require('./routes/contactRoutes')); // Use the contactRoutes for any requests to /api/contacts
app.use('api/users', require('./routes/userRoutes')); // Use the userRoutes for any requests to /api/users