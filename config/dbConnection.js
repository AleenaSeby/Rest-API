 // Import the Mongoose library to connect to MongoDB and define schemas and models
const mongoose = require('mongoose');

// Function to connect to the MongoDB database using the connection string from the environment variables
const connectDB = async () => {
    try {
       const connect =  await mongoose.connect(process.env.CONNECTION_STRING);
         console.log(`MongoDB connected: ${connect.connection.host}, ${connect.connection.name}`); // Log a message to the console when the connection is successful
    } catch (error) {
        console.error(`Error: ${error.message}`); // Log any errors that occur during the connection process
        process.exit(1); // Exit the process with a failure code if the connection fails
    }
}
module.exports = connectDB; // Export the connectDB function to be used in other parts of the application