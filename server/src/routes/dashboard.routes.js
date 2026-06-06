const express = require("express");
const asyncHandler = require("express-async-handler");

const { protect } = require("../middleware/auth");
const SimulationProject = require("../models/SimulationProject");
const SimulationFile = require("../models/SimulationFile");
const AnalysisResult = require("../models/AnalysisResult");

const router = express.Router();

router.use(protect);

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const [projectCount, fileCount, analysisCount, latestAnalyses] = await Promise.all([
      SimulationProject.countDocuments({ owner: req.user._id }),
      SimulationFile.countDocuments({ owner: req.user._id }),
      AnalysisResult.countDocuments({ owner: req.user._id }),
      AnalysisResult.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5)
    ]);

    const anomalyCount = latestAnalyses.reduce((total, analysis) => total + (analysis.anomalies?.length || 0), 0);

    res.json({
      projectCount,
      fileCount,
      analysisCount,
      anomalyCount,
      latestAnalyses
    });
  })
);

module.exports = router;

