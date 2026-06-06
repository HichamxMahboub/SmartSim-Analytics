const mongoose = require("mongoose");

const simulationProjectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    systemType: { type: String, required: true, trim: true },
    simulationDate: { type: Date, default: Date.now },
    parameters: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SimulationProject", simulationProjectSchema);

