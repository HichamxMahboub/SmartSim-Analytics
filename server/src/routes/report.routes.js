const express = require("express");
const asyncHandler = require("express-async-handler");

const { protect } = require("../middleware/auth");
const SimulationProject = require("../models/SimulationProject");
const AnalysisResult = require("../models/AnalysisResult");
const { streamAnalysisReport } = require("../services/reportService");

const router = express.Router();

router.use(protect);

router.get(
  "/:projectId/:analysisId",
  asyncHandler(async (req, res) => {
    const [project, analysis] = await Promise.all([
      SimulationProject.findOne({ _id: req.params.projectId, owner: req.user._id }),
      AnalysisResult.findOne({ _id: req.params.analysisId, owner: req.user._id })
    ]);

    if (!project || !analysis) {
      res.status(404);
      throw new Error("Project or analysis not found.");
    }

    streamAnalysisReport(res, project, analysis);
  })
);

module.exports = router;

