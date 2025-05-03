export interface GitHubRepoStats {
  stars: number;
  forks: number;
  issues: number;
  contributors: number;
  commits: number;
  pullRequests: number;
  lastUpdated: string;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

const GITHUB_API_BASE_URL = 'https://api.github.com';
const DEFAULT_REPO_OWNER = 'zaid-commits'; // Default GitHub username/org
const DEFAULT_REPO_NAME = 'autodocs.ai'; // Default repository name

// Get GitHub token from environment variable
const getGitHubToken = (): string | null => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.GITHUB_API_TOKEN || null;
  } else {
    // Client-side
    return process.env.NEXT_PUBLIC_GITHUB_API_TOKEN || null;
  }
};

/**
 * Creates headers for GitHub API requests with authentication if token is available
 */
const createGitHubHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  
  const token = getGitHubToken();
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  return headers;
};

/**
 * Fetches repository stats from GitHub API
 */
export async function fetchRepoStats(fullRepoName?: string): Promise<GitHubRepoStats> {
  try {
    let repoOwner = DEFAULT_REPO_OWNER;
    let repoName = DEFAULT_REPO_NAME;
    
    // Parse repository owner and name from full name if provided
    if (fullRepoName) {
      const [owner, name] = fullRepoName.split('/');
      if (owner && name) {
        repoOwner = owner;
        repoName = name;
      }
    }
    
    // Get basic repo information
    const repoResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}`, {
      headers: createGitHubHeaders()
    });
    if (!repoResponse.ok) throw new Error('Failed to fetch repository data');
    const repoData = await repoResponse.json();
    
    // Get contributors count
    const contributorsResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/contributors?per_page=1&anon=false`, {
      headers: createGitHubHeaders()
    });
    const contributorsCount = parseInt(contributorsResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');
    
    // Get pull requests count
    const prResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/pulls?state=all&per_page=1`, {
      headers: createGitHubHeaders()
    });
    const prCount = parseInt(prResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');
    
    // Get commits count
    const commitsResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/commits?per_page=1`, {
      headers: createGitHubHeaders()
    });
    const commitsCount = parseInt(commitsResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');
    
    return {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      issues: repoData.open_issues_count || 0,
      contributors: contributorsCount || 0,
      commits: commitsCount || 0,
      pullRequests: prCount || 0,
      lastUpdated: repoData.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return {
      stars: 0,
      forks: 0,
      issues: 0,
      contributors: 0,
      commits: 0,
      pullRequests: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Fetches top contributors from GitHub API
 */
export async function fetchTopContributors(fullRepoName?: string, limit: number = 5): Promise<GitHubContributor[]> {
  try {
    let repoOwner = DEFAULT_REPO_OWNER;
    let repoName = DEFAULT_REPO_NAME;
    
    // Parse repository owner and name from full name if provided
    if (fullRepoName) {
      const [owner, name] = fullRepoName.split('/');
      if (owner && name) {
        repoOwner = owner;
        repoName = name;
      }
    }
    
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/contributors?per_page=${limit}`, {
      headers: createGitHubHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch contributors');
    const contributors = await response.json();
    return contributors;
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

/**
 * Fetches repository README content
 */
export async function fetchRepoReadme(fullRepoName?: string): Promise<string> {
  try {
    let repoOwner = DEFAULT_REPO_OWNER;
    let repoName = DEFAULT_REPO_NAME;
    
    // Parse repository owner and name from full name if provided
    if (fullRepoName) {
      const [owner, name] = fullRepoName.split('/');
      if (owner && name) {
        repoOwner = owner;
        repoName = name;
      }
    }
    
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/readme`, {
      headers: createGitHubHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch README');
    const readmeData = await response.json();
    
    // README content is base64 encoded
    const content = atob(readmeData.content);
    return content;
  } catch (error) {
    console.error('Error fetching README:', error);
    return 'README not available';
  }
}

/**
 * Fetches repository issues
 */
export async function fetchRepoIssues(fullRepoName?: string, limit: number = 10): Promise<string> {
  try {
    let repoOwner = DEFAULT_REPO_OWNER;
    let repoName = DEFAULT_REPO_NAME;
    
    // Parse repository owner and name from full name if provided
    if (fullRepoName) {
      const [owner, name] = fullRepoName.split('/');
      if (owner && name) {
        repoOwner = owner;
        repoName = name;
      }
    }
    
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/issues?state=open&per_page=${limit}`, {
      headers: createGitHubHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch issues');
    const issues = await response.json();
    
    if (issues.length === 0) {
      return 'No open issues found';
    }
    
    return issues.map((issue: any) => 
      `#${issue.number}: ${issue.title}\n${issue.body?.slice(0, 150)}${issue.body?.length > 150 ? '...' : ''}\n`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching issues:', error);
    return 'Issues not available';
  }
}

/**
 * Fetches repository pull requests
 */
export async function fetchRepoPullRequests(fullRepoName?: string, limit: number = 10): Promise<string> {
  try {
    let repoOwner = DEFAULT_REPO_OWNER;
    let repoName = DEFAULT_REPO_NAME;
    
    // Parse repository owner and name from full name if provided
    if (fullRepoName) {
      const [owner, name] = fullRepoName.split('/');
      if (owner && name) {
        repoOwner = owner;
        repoName = name;
      }
    }
    
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}/pulls?state=open&per_page=${limit}`, {
      headers: createGitHubHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch pull requests');
    const prs = await response.json();
    
    if (prs.length === 0) {
      return 'No open pull requests found';
    }
    
    return prs.map((pr: any) => 
      `#${pr.number}: ${pr.title}\n${pr.body?.slice(0, 150)}${pr.body?.length > 150 ? '...' : ''}\n`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return 'Pull requests not available';
  }
}

/**
 * Fetches repository details (used by GitHubRepoInfo component)
 */
export async function fetchRepoDetails(repoOwner: string, repoName: string) {
  try {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${repoOwner}/${repoName}`, {
      headers: createGitHubHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repository details: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching repository details:', error);
    throw error;
  }
}
