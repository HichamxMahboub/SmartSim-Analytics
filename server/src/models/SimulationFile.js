const mongoose = require("mongoose");

const simulationFileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "SimulationProject", required: true, index: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number, required: true },
    columns: [{ type: String }],
    status: {
      type: String,
      enum: ["uploaded", "analyzed", "failed"],
      default: "uploaded"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SimulationFile", simulationFileSchema);

