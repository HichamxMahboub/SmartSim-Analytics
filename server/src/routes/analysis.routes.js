const express = require("express");
const asyncHandler = require("express-async-handler");

const { protect } = require("../middleware/auth");
const SimulationFile = require("../models/SimulationFile");
const AnalysisResult = require("../models/AnalysisResult");
const { runPythonAnalysis } = require("../services/pythonAnalyzer");

const router = express.Router();

router.use(protect);

router.post(
  "/:fileId/run",
  asyncHandler(async (req, res) => {
    const file = await SimulationFile.findOne({ _id: req.params.fileId, owner: req.user._id });

    if (!file) {
      res.status(404);
      throw new Error("File not found.");
    }

    try {
      const result = await runPythonAnalysis(file.path);
      const analysis = await AnalysisResult.create({
        owner: req.user._id,
        project: file.project,
        file: file._id,
        kpis: result.kpis,
        anomalies: result.anomalies,
        trend: result.trend,
        stability: result.stability,
        recommendations: result.recommendations,
        sample: result.sample,
        raw: result
      });

      file.status = "analyzed";
      await file.save();
      res.status(201).json(analysis);
    } catch (error) {
      file.status = "failed";
      await file.save();
      throw error;
    }
  })
);

router.get(
  "/:fileId",
  asyncHandler(async (req, res) => {
    const analysis = await AnalysisResult.findOne({ file: req.params.fileId, owner: req.user._id }).sort({ createdAt: -1 });

    if (!analysis) {
      res.status(404);
      throw new Error("Analysis not found.");
    }

    res.json(analysis);
  })
);

module.exports = router;

