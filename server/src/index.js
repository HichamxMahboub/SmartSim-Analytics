require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");

const connectDb = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const analysisRoutes = require("./routes/analysis.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS origin not allowed: ${origin}`);
      error.statusCode = 403;
      return callback(error);
    }
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  const databaseStates = ["disconnected", "connected", "connecting", "disconnecting"];

  res.json({
    status: "ok",
    service: "SmartSim Analytics API",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: databaseStates[mongoose.connection.readyState] || "unknown"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`SmartSim Analytics API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("API startup failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;

