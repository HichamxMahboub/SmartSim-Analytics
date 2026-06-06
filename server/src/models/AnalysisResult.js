const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "SimulationProject", required: true, index: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: "SimulationFile", required: true, index: true },
    kpis: { type: mongoose.Schema.Types.Mixed, required: true },
    anomalies: [{ type: mongoose.Schema.Types.Mixed }],
    trend: { type: String, default: "stable" },
    stability: { type: mongoose.Schema.Types.Mixed, default: {} },
    recommendations: [{ type: String }],
    sample: [{ type: mongoose.Schema.Types.Mixed }],
    raw: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);

