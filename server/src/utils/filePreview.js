const fs = require("fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");

async function parseSimulationFile(filePath, limit = 400) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, "utf8");

  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : parsed.data || [];
    if (!Array.isArray(rows)) {
      throw new Error("JSON simulation files must be an array or an object with a data array.");
    }

    if (rows.some(row => row === null || Array.isArray(row) || typeof row !== "object")) {
      throw new Error("JSON simulation rows must be objects with named signal fields.");
    }

    return rows.slice(0, limit);
  }

  if (ext !== ".csv") {
    throw new Error("Only CSV and JSON simulation files are accepted.");
  }

  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: value => {
      const numeric = Number(value);
      return Number.isFinite(numeric) && value !== "" ? numeric : value;
    }
  });

  return rows.slice(0, limit);
}

function extractColumns(rows) {
  if (!rows.length) {
    return [];
  }

  return Object.keys(rows[0]);
}

module.exports = { parseSimulationFile, extractColumns };

