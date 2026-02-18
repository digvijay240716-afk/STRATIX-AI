export interface Metric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  forecast?: number;
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface SimulationScenario {
  adSpend: number;
  pricePoint: number;
  marketGrowth: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  INSIGHTS = 'INSIGHTS',
  SIMULATION = 'SIMULATION',
  STRATEGY = 'STRATEGY',
  LIVE = 'LIVE'
}
