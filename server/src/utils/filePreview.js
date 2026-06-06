const fs = require("fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");

async function parseSimulationFile(filePath, limit = 400) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, "utf8");

  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : parsed.data || [];
    return rows.slice(0, limit);
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

