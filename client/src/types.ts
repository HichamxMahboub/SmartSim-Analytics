export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SimulationProject {
  _id: string;
  name: string;
  description: string;
  systemType: string;
  simulationDate: string;
  parameters: Record<string, unknown>;
  createdAt: string;
}

export interface SimulationFile {
  _id: string;
  originalName: string;
  filename: string;
  columns: string[];
  size: number;
  status: "uploaded" | "analyzed" | "failed";
  createdAt: string;
}

export interface AnalysisResult {
  _id: string;
  project: string;
  file: string;
  kpis: Record<string, Record<string, number | string | null>>;
  anomalies: Array<Record<string, number | string | null>>;
  trend: string;
  stability: Record<string, number | string | null>;
  recommendations: string[];
  sample: SimulationRow[];
  createdAt: string;
}

export interface SimulationRow {
  [key: string]: number | string | null;
}

export interface ProjectDetailResponse {
  project: SimulationProject;
  files: SimulationFile[];
  analyses: AnalysisResult[];
}

export interface DashboardSummary {
  projectCount: number;
  fileCount: number;
  analysisCount: number;
  anomalyCount: number;
  latestAnalyses: AnalysisResult[];
}

