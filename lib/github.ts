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
const REPO_OWNER = 'zaid-commits'; // Update this with actual GitHub username/org
const REPO_NAME = 'autodocs.ai'; // Update this with actual repository name

/**
 * Fetches repository stats from GitHub API
 */
export async function fetchRepoStats(): Promise<GitHubRepoStats> {
  try {
    // Get basic repo information
    const repoResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}`);
    if (!repoResponse.ok) throw new Error('Failed to fetch repository data');
    const repoData = await repoResponse.json();
    
    // Get contributors count
    const contributorsResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=1&anon=false`);
    const contributorsCount = parseInt(contributorsResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');
    
    // Get pull requests count
    const prResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=1`);
    const prCount = parseInt(prResponse.headers.get('Link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');
    
    // Get commits count
    const commitsResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=1`);
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
export async function fetchTopContributors(limit: number = 5): Promise<GitHubContributor[]> {
  try {
    const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch contributors');
    const contributors = await response.json();
    return contributors;
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}
