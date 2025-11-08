const express = require('express');
const router = express.Router();

// Minimal placeholder routes for game
router.get('/', (req, res) => {
	res.json({ message: 'Game route (placeholder)' });
});

module.exports = router;

