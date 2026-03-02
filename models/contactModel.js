const mongoose = require('mongoose');
// Define a Mongoose schema for the Contact model,
//  which represents a contact in the database
const contactSchmema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Define the user_id field as an ObjectId, which is a reference to a
        //  user document in the database
        required: true, // Make the user_id field required
        ref: "User" // Reference the User model to establish a relationship between contacts and users
    },
    name: {
        type: String,
        require: [true, "Please provide a name for the contact"]
    },
    email: {
        type: String,
        require: [true, "Please provide an email for the contact"]
    },
    phone: {
        type: String,
        require: [true, "Please provide a phone number for the contact"],
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model("Contact", contactSchmema); 
// Export the Contact model to be used in other parts of the application