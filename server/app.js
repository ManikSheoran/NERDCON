const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const gameRoutes = require("./routes/gameRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const { protect } = require("./middleware/auth.js");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    // "http://localhost:5173",
    // "http://127.0.0.1:5173",
    "https://nerdcon.vercel.app",
    "https://nerdcon-git-main-maniksheoran.vercel.app"
  ],
  credentials: true
}));

// Body parser
app.use(express.json());

// Simple in-memory cache for leaderboard
let leaderboardCache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;
app.locals.getLeaderboardCache = () => leaderboardCache;
app.locals.setLeaderboardCache = (data) => {
  leaderboardCache = { data, timestamp: Date.now() };
};

// Protect hint images - requires authentication
app.use("/hints", protect, express.static(path.join(__dirname, "hints")));

app.get("/", (req, res) => {
  res.json({ message: "NerdCon API", status: "operational" });
});

// Debug endpoint only in development
if (process.env.NODE_ENV !== 'production') {
  app.get("/debug/hints", (req, res) => {
    const fs = require('fs');
    const hintsPath = path.join(__dirname, "hints");
    
    try {
      const files = fs.readdirSync(hintsPath);
      res.json({ 
        hintsFolder: hintsPath,
        files: files,
        testUrl: `http://localhost:${process.env.PORT || 4000}/hints/hint1.png`
      });
    } catch (error) {
      res.status(500).json({ error: "Debug endpoint error" });
    }
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes); // Hidden admin route

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      message: "An error occurred. Please try again later." 
    });
  } else {
    res.status(500).json({ 
      message: err.message,
      stack: err.stack 
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API: http://localhost:${PORT}`)   ;
});