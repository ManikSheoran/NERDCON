const express = require('express');
const router = express.Router();

// Minimal placeholder routes for auth
router.get('/', (req, res) => {
	res.json({ message: 'Auth route (placeholder)' });
});

module.exports = router;

