const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Team = require("../models/Team.js");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
      const allowedEmails = require('../config/allowedEmails.json');
      if (!allowedEmails || !Array.isArray(allowedEmails) || !allowedEmails.map(e => e.toLowerCase()).includes(String(email).toLowerCase())) {
        return res.status(403).json({ message: 'Email not allowed to register' });
      }

      const existing = await Team.findOne({ $or: [{ name }, { email }] });
      if (existing) return res.status(400).json({ message: "Team name or email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const team = await Team.create({ name, email, passwordHash: hash });

    res.status(201).json({ message: "Registered successfully", teamId: team._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const team = await Team.findOne({ email });
    if (!team) return res.status(404).json({ message: "Team not found" });

    const match = await bcrypt.compare(password, team.passwordHash);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: team._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { register, login };
