const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Team = require("../models/Team.js");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if phone number is allowed
    const allowedEmails = require('../config/allowedEmails.json');
    if (!allowedEmails || !allowedEmails.includes(email)) {
      return res.status(403).json({ message: 'Phone number not allowed to register' });
    }

    // Check if team already exists
    const existing = await Team.findOne({ $or: [{ name }, { email }] });
    if (existing) {
      return res.status(400).json({ message: "Team name or phone number already registered" });
    }

    // Create new team
    const hash = await bcrypt.hash(password, 10);
    
    const team = await Team.create({ 
      name, 
      email, 
      passwordHash: hash,
      gameState: {
        currentHintId: 1,
        completedHints: [],
        visitedLocations: [],
        unlockedIntels: [],
        penalties: 0
      }
    });

    res.status(201).json({ message: "Registered successfully! Your quest begins with Hint 1.", teamId: team._id });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const team = await Team.findOne({ email });
    if (!team) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const match = await bcrypt.compare(password, team.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const token = jwt.sign({ id: team._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

module.exports = { register, login };
