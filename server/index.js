require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./initDB");

const app = express();
const isVercel = Boolean(process.env.VERCEL);

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const getMissingEnv = () => requiredEnv.filter((key) => !process.env[key]);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  const missingEnv = getMissingEnv();
  res.json({
    status: missingEnv.length ? "missing-env" : "ok",
    missingEnv,
  });
});

app.use("/api", async (req, res, next) => {
  const missingEnv = getMissingEnv();
  if (missingEnv.length) {
    return res.status(500).json({
      message: `Missing required environment variables: ${missingEnv.join(", ")}`,
    });
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/dashboard", require("./routes/dashboard"));

if (process.env.NODE_ENV === "production" && !isVercel) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const missingEnv = getMissingEnv();
    if (missingEnv.length) {
      throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    }

    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

if (!isVercel) {
  startServer();
}

module.exports = app;
