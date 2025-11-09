const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const gameRoutes = require("./routes/gameRoutes.js");

dotenv.config();
connectDB();

const app = express();
const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigins = allowedOrigins.length ? allowedOrigins : defaultOrigins;
const allowAll = corsOrigins.includes("*");

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowAll || !origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Serve static hint images
app.use("/hints", express.static(path.join(__dirname, "hints")));

app.get("/", (req, res) => {
    res.send("Welcome to the NerdCon API");
});

// Debug route to test hints folder
app.get("/debug/hints", (req, res) => {
  const fs = require('fs');
  const hintsPath = path.join(__dirname, "hints");
  
  try {
    const files = fs.readdirSync(hintsPath);
    res.json({ 
      hintsFolder: hintsPath,
      files: files,
      testUrl: `http://localhost:${PORT}/hints/hint1.png`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}`)   ;
});