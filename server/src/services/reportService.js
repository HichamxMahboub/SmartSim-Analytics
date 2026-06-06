const PDFDocument = require("pdfkit");

function writeKeyValue(doc, label, value) {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(String(value));
}

function streamAnalysisReport(res, project, analysis) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const filename = `${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}-analysis-report.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(20).font("Helvetica-Bold").text("SmartSim Analytics Report");
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").fillColor("#444").text("Demonstrative MATLAB/Simulink + Python + MERN analysis report.");
  doc.fillColor("#000").moveDown();

  doc.fontSize(15).font("Helvetica-Bold").text("Simulation Project");
  doc.moveDown(0.4);
  writeKeyValue(doc, "Name", project.name);
  writeKeyValue(doc, "System type", project.systemType);
  writeKeyValue(doc, "Simulation date", project.simulationDate.toISOString().slice(0, 10));
  doc.font("Helvetica-Bold").text("Description:");
  doc.font("Helvetica").text(project.description || "No description provided.");
  doc.moveDown();

  doc.fontSize(15).font("Helvetica-Bold").text("KPIs");
  doc.moveDown(0.4);
  const kpis = analysis.kpis || {};
  Object.entries(kpis).forEach(([signal, metrics]) => {
    doc.fontSize(12).font("Helvetica-Bold").text(signal);
    Object.entries(metrics).forEach(([metric, value]) => {
      if (typeof value !== "object") {
        writeKeyValue(doc, `  ${metric}`, value);
      }
    });
    doc.moveDown(0.2);
  });

  doc.moveDown();
  doc.fontSize(15).font("Helvetica-Bold").text("Anomalies");
  doc.moveDown(0.4);
  if (analysis.anomalies?.length) {
    analysis.anomalies.slice(0, 20).forEach((anomaly, index) => {
      doc.fontSize(10).font("Helvetica").text(
        `${index + 1}. signal=${anomaly.signal}, time=${anomaly.time}, value=${anomaly.value}, z=${anomaly.z_score}`
      );
    });
  } else {
    doc.fontSize(10).font("Helvetica").text("No anomaly detected with the current z-score threshold.");
  }

  doc.moveDown();
  doc.fontSize(15).font("Helvetica-Bold").text("Recommendations");
  doc.moveDown(0.4);
  const recommendations = analysis.recommendations?.length
    ? analysis.recommendations
    : ["No critical issue detected. Continue monitoring with a larger simulation dataset."];
  recommendations.forEach(item => doc.fontSize(10).font("Helvetica").text(`- ${item}`));

  doc.moveDown();
  doc.fontSize(9).fillColor("#555").text(`Generated on ${new Date().toISOString()}`);
  doc.end();
}

module.exports = { streamAnalysisReport };

