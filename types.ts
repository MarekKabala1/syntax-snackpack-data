export interface SnackPackIssue {
  id: string;
  title: string;
  date: string;
  url: string;
  issueNumber?: string;
}

export interface ScraperMetadata {
  lastUpdated: string;
  totalIssues: number;
  version: string;
}

export interface SnackPackData {
  metadata: ScraperMetadata;
  issues: SnackPackIssue[];
}