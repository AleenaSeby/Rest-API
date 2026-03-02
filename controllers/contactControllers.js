// Controllers are responsible for handling the logic of the application.
//  They receive requests from the routes and send responses back to the client.
//  In this file, we will define the functions that will handle the requests for the contact routes.
const asyncHandler = require('express-async-handler'); 
// Import the express-async-handler library to handle asynchronous functions in Express routes
// The asyncHandler function is a higher-order function that takes an asynchronous function as an argument 
// and returns a new function that wraps the original function in a try-catch block. 
// This allows us to handle errors in asynchronous functions without having to write
//  try-catch blocks in every route handler.  
 
const Contact = require('../models/contactModel'); // Import the Contact model to interact with the contacts collection in the database



//@desc Get all contacts
//@route GET /api/contacts
//@access Private
const getAllContacts = asyncHandler(async (req, res) => {
    // res.status(200).json({message: "Get all contacts"});
    const contacts = await Contact.find({ user_id: req.user._id }); 
    // Use the Contact model to find all contacts in the database for the authenticated user
    // user_id is a field in the Contact model that references the ID of the user who created the contact.
    // req.user is the authenticated user object that is attached to the request by the validateToken middleware.
    res.status(200).json(contacts); // Send the contacts as a JSON response with a status of 200 (OK)
});
//@desc Get contact by ID
//@route GET /api/contacts/:id
//@access Private
const getContactById = asyncHandler(async (req, res) => {
    // res.status(200).json({message: `Get contact by ID: ${req.params.id}`});
    const contact = await Contact.findById(req.params.id); // Use the Contact model to find a contact by its ID in the database
    if (!contact) { // If no contact is found with the given ID
        res.status(404); // Set the response status to 404 (Not Found)
        throw new Error("Contact not found"); // Throw an error with a message indicating that the contact was not found
    }
    if (contact.user_id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("User not authorized to view this contact");
    }
    res.status(200).json(contact); // Send the found contact as a JSON response with a status of 200 (OK)
});
// @desc Create a new contact
// @route POST /api/contacts
// @access Private
const createContact = asyncHandler(async (req, res) => {
    console.log("Request body:", req.body); // Log the request body to the console for debugging purposes
    const { name, email, phone } = req.body; // Destructure the name, email, and phone properties from the request body
    if (!name || !email || !phone) { // Check if any of the required fields are missing
        res.status(400); // Set the response status to 400 (Bad Request)
        throw new Error("Please provide name, email, and phone"); // If any of the required fields are missing, throw an error with a message
    }
    const contact = await Contact.create({ name, email, phone, user_id: req.user._id }); // Use the Contact model to create a new contact in the database with the provided name, email, and phone
    res.status(201).json(contact); // Send the created contact as a JSON response with a status of 201 (Created)
    // res.status(201).json({message: "Create a new contact"});
});
// @desc Update a contact
// @route PUT /api/contacts/:id
// @access Private
const updateContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id); // Use the Contact model to find a contact by its ID in the database
    if (!contact) { // If no contact is found with the given ID
        res.status(404); // Set the response status to 404 (Not Found)
        throw new Error("Contact not found"); // Throw an error with a message indicating that the contact was not found
    }
    if (contact.user_id.toString() !== req.user._id.toString()) { // Check if the user ID of the contact matches the authenticated user's ID
        res.status(403); // Set the response status to 403 (Forbidden)
        throw new Error("User not authorized to update this contact"); // If the user IDs do not match, throw an error with a message indicating that the user is not authorized to update this contact
    }
    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // Return the updated contact instead of the original one
    );
    res.status(200).json(updatedContact); // Send the updated contact as a JSON response with a status of 200 (OK)
}); 
// @desc Delete a contact
// @route DELETE /api/contacts/:id
// @access Private 
const deleteContact = asyncHandler(async (req, res) => {
    // res.status(200).json({message: `Delete contact with ID: ${req.params.id}`});
    const contact = await Contact.findById(req.params.id); // Use the Contact model to find a contact by its ID in the database
    if (!contact) { // If no contact is found with the given ID
        res.status(404); // Set the response status to 404 (Not Found)
        throw new Error("Contact not found"); // Throw an error with a message indicating that the contact was not found
    }
    if (contact.user_id.toString() !== req.user._id.toString()) { // Check if the user ID of the contact matches the authenticated user's ID
        res.status(403); // Set the response status to 403 (Forbidden)
        throw new Error("User not authorized to delete this contact"); // If the user IDs do not match, throw an error with a message indicating that the user is not authorized to delete this contact
    }
    await Contact.findByIdAndDelete(req.params.id); // Use the Contact model to find a contact by its ID and delete it from the database
    res.status(200).json({ message: "Contact deleted successfully" }); // Send a JSON response with a message indicating that the contact was deleted successfully and a status of 200 (OK)
});

// Export the functions to be used in the routes
module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
};