const express = require('express');
const { getTeamsCSV, getTeamsData } = require('../controllers/adminController.js');

const router = express.Router();

// Hidden unprotected routes (no auth required, just secret URL)
router.get('/teams/csv', getTeamsCSV);
router.get('/teams/data', getTeamsData);

module.exports = router;
