// Simple interface for context options without using Mongoose
export interface IContextOptions {
  includeReadme: boolean;
  includeSourceCode: boolean;
  includeIssues: boolean;
  includePullRequests: boolean;
  quickMode?: boolean;
  customPrompt?: string;
}

// Document interface for cache entries
export interface IDocCache {
  repoOwner: string;
  repoName: string;
  contextOptions: IContextOptions;
  documentation: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to compare context options for equality
export function areContextOptionsEqual(a: IContextOptions, b: IContextOptions): boolean {
  return (
    a.includeReadme === b.includeReadme &&
    a.includeSourceCode === b.includeSourceCode &&
    a.includeIssues === b.includeIssues &&
    a.includePullRequests === b.includePullRequests &&
    a.quickMode === b.quickMode &&
    (a.customPrompt || '') === (b.customPrompt || '')
  );
}