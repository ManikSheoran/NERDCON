const jwt = require('jsonwebtoken');
const Team = require('../models/Team.js');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const team = await Team.findById(decoded.id);
    if (!team) return res.status(401).json({ message: 'Team not found' });

    req.user = team;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Not authorized', error: e.message });
  }
};

module.exports = { protect };
