export interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  pe: number; // Price to Earnings
  pb: number; // Price to Book
  ps: number; // Price to Sales
  dividendYield: number; // Percentage
  marketCap: string;
  sector: string;
  industry: string;
  description: string;
  lastUpdated: string;
  valuationScore?: number; // 0-100 calculated score
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  dividendYield: number;
  sector: string;
  rationale: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  SCREENER = 'SCREENER',
  WATCHLIST = 'WATCHLIST'
}

export interface AlertMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}