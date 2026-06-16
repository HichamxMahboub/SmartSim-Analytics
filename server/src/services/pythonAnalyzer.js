const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const ALLOWED_EXTENSIONS = new Set([".csv", ".json"]);
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_OUTPUT_BYTES = 1024 * 1024;

function createAnalysisError(message, statusCode = 422) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function resolveUploadPath(filePath) {
  const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads");
  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(uploadsRoot, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw createAnalysisError("Analysis can only run against uploaded simulation files.", 400);
  }

  const extension = path.extname(resolvedPath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw createAnalysisError("Only CSV and JSON simulation files can be analyzed.", 400);
  }

  return resolvedPath;
}

async function ensureReadableFile(filePath) {
  let stats;

  try {
    stats = await fs.stat(filePath);
  } catch (error) {
    throw createAnalysisError("Simulation file is missing or empty.", 400);
  }

  if (!stats.isFile() || stats.size === 0) {
    throw createAnalysisError("Simulation file is missing or empty.", 400);
  }
}

async function runPythonAnalysis(filePath) {
  const resolvedFilePath = resolveUploadPath(filePath);
  await ensureReadableFile(resolvedFilePath);

  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || "python3";
    const scriptPath = path.join(__dirname, "..", "..", "scripts", "analyze_simulation.py");
    const timeoutMs = Number(process.env.PYTHON_ANALYSIS_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
    const maxOutputBytes = Number(process.env.PYTHON_ANALYSIS_MAX_OUTPUT_BYTES || DEFAULT_MAX_OUTPUT_BYTES);
    const child = spawn(pythonBin, [scriptPath, resolvedFilePath], {
      cwd: path.join(__dirname, "..", "..")
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      settled = true;
      child.kill("SIGKILL");
      reject(createAnalysisError(`Python analysis timed out after ${timeoutMs}ms.`, 504));
    }, timeoutMs);

    function appendOutput(current, chunk) {
      const next = current + chunk.toString();
      if (Buffer.byteLength(next, "utf8") > maxOutputBytes) {
        settled = true;
        child.kill("SIGKILL");
        reject(createAnalysisError("Python analysis output exceeded the configured safety limit.", 500));
      }
      return next;
    }

    child.stdout.on("data", chunk => {
      if (!settled) {
        stdout = appendOutput(stdout, chunk);
      }
    });

    child.stderr.on("data", chunk => {
      if (!settled) {
        stderr = appendOutput(stderr, chunk);
      }
    });

    child.on("error", error => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(error);
      }
    });

    child.on("close", code => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      if (code !== 0) {
        return reject(createAnalysisError(stderr.trim() || `Python analysis failed with code ${code}`));
      }

      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (error) {
        reject(createAnalysisError(`Invalid JSON returned by Python script: ${error.message}`, 500));
      }
    });
  });
}

module.exports = { runPythonAnalysis };

