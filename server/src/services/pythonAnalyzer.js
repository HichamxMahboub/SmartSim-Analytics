const { spawn } = require("child_process");
const path = require("path");

function runPythonAnalysis(filePath) {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || "python3";
    const scriptPath = path.join(__dirname, "..", "..", "scripts", "analyze_simulation.py");
    const child = spawn(pythonBin, [scriptPath, filePath], {
      cwd: path.join(__dirname, "..", "..")
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", code => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python analysis failed with code ${code}`));
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Invalid JSON returned by Python script: ${error.message}`));
      }
    });
  });
}

module.exports = { runPythonAnalysis };

