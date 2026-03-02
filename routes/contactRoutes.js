const express = require('express');
const router = express.Router();
const {  getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact } = require('../controllers/contactControllers');
const validateToken = require('../middleware/validateTokenHandler');

// roter.route() takes 2 arguments: the path and a callback function that runs when a request is made to that path
// router.route('/').get((req, res) => {
//     res.status(200).json({message: "Get all contacts"});
// });
router.use(validateToken); // Use the validateToken middleware to protect all routes defined in this router, ensuring that only authenticated users can access these routes
router.route('/').get(getAllContacts).post(createContact); // Use the getAllContacts function from the contactControllers.js file to handle GET requests to the /api/contacts path

router.route('/:id').get(getContactById).put(updateContact).delete(deleteContact); // Use the getContactById function from the contactControllers.js file to handle GET requests to the /api/contacts/:id path
// router.route('/').post(createContact); // Use the createContact function from the contactControllers.js file to handle POST requests to the /api/contacts path
// router.route('/:id').put(updateContact); // Use the updateContact function from the contactControllers.js file to handle PUT requests to the /api/contacts/:id path
// router.route('/:id').delete(deleteContact); // Use the deleteContact function from the contactControllers.js file to handle DELETE requests to the /api/contacts/:id path


module.exports = router;