/** Public visitor count (main / event) */
export interface VisitorCountResponse {
  dailyCount: number;
  totalCumulativeCount: number;
}

/** Admin dashboard daily trend item */
export interface VisitorTrendItem {
  date: string;
  count: number;
}

export type VisitorTrendTarget = 'MAIN' | string;
