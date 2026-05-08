require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const { connectDB } = require("./initDB");

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/projects",  require("./routes/projects"));
app.use("/api/tasks",     require("./routes/tasks"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
