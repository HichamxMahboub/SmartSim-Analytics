const express = require("express");
const asyncHandler = require("express-async-handler");
const { z } = require("zod");

const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const SimulationProject = require("../models/SimulationProject");
const SimulationFile = require("../models/SimulationFile");
const AnalysisResult = require("../models/AnalysisResult");
const { parseSimulationFile, extractColumns } = require("../utils/filePreview");

const router = express.Router();

const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  systemType: z.string().min(2),
  simulationDate: z.coerce.date().optional(),
  parameters: z.record(z.any()).optional().default({})
});

router.use(protect);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const projects = await SimulationProject.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = projectSchema.parse(req.body);
    const project = await SimulationProject.create({
      ...payload,
      owner: req.user._id
    });
    res.status(201).json(project);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const project = await SimulationProject.findOne({ _id: req.params.id, owner: req.user._id });

    if (!project) {
      res.status(404);
      throw new Error("Project not found.");
    }

    const files = await SimulationFile.find({ project: project._id, owner: req.user._id }).sort({ createdAt: -1 });
    const analyses = await AnalysisResult.find({ project: project._id, owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ project, files, analyses });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = projectSchema.partial().parse(req.body);
    const project = await SimulationProject.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      payload,
      { new: true }
    );

    if (!project) {
      res.status(404);
      throw new Error("Project not found.");
    }

    res.json(project);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const project = await SimulationProject.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!project) {
      res.status(404);
      throw new Error("Project not found.");
    }

    await SimulationFile.deleteMany({ project: project._id, owner: req.user._id });
    await AnalysisResult.deleteMany({ project: project._id, owner: req.user._id });
    res.status(204).send();
  })
);

router.post(
  "/:projectId/files",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const project = await SimulationProject.findOne({ _id: req.params.projectId, owner: req.user._id });

    if (!project) {
      res.status(404);
      throw new Error("Project not found.");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("A CSV or JSON file is required.");
    }

    const rows = await parseSimulationFile(req.file.path, 5);
    const columns = extractColumns(rows);
    if (!rows.length || !columns.length) {
      res.status(400);
      throw new Error("Simulation file must include at least one row with named columns.");
    }

    const file = await SimulationFile.create({
      owner: req.user._id,
      project: project._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      columns
    });

    res.status(201).json({ file, preview: rows });
  })
);

router.get(
  "/:projectId/files/:fileId/data",
  asyncHandler(async (req, res) => {
    const file = await SimulationFile.findOne({
      _id: req.params.fileId,
      project: req.params.projectId,
      owner: req.user._id
    });

    if (!file) {
      res.status(404);
      throw new Error("File not found.");
    }

    const rows = await parseSimulationFile(file.path, 800);
    res.json({ rows, columns: extractColumns(rows) });
  })
);

module.exports = router;

