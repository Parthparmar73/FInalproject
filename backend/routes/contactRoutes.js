const express = require('express');
const router = express.Router();
const { saveContact } = require('../controllers/contactController');

router.post('/contact', saveContact);

module.exports = router;