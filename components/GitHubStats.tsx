"use client";

import React, { useEffect, useState } from 'react';
import { GitHubRepoStats, GitHubContributor, fetchRepoStats, fetchTopContributors } from '@/lib/github';
import { Loader2, Star, GitFork, Users, GitPullRequest, GitCommit, BookOpen, Code, MessageSquare } from 'lucide-react';

interface GitHubStatsProps {
  repoName?: string; // Keep repoName to fetch stats/contributors
  contextOptions?: { // Keep contextOptions to display which context was used
    includeReadme: boolean;
    includeSourceCode: boolean;
    includeIssues: boolean;
    includePullRequests: boolean;
  } | null;
  documentation: string; // Added documentation prop
  isLoading: boolean; // Added isLoading prop (for documentation)
  error: string | null; // Added error prop (for documentation)
}

export default function GitHubStats({
  repoName,
  contextOptions,
  documentation,
  isLoading,
  error
}: GitHubStatsProps) {
  const [repoStats, setRepoStats] = useState<GitHubRepoStats | null>(null);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [statsLoading, setStatsLoading] = useState(true); // Separate loading state for stats/contributors
  const [statsError, setStatsError] = useState<string | null>(null); // Separate error state for stats/contributors

  useEffect(() => {
    async function loadStatsAndContributors() {
      if (!repoName) {
        setStatsLoading(false);
        setStatsError("Repository name not provided.");
        return;
      }

      setStatsLoading(true);
      setStatsError(null);

      try {
        // Fetch repo stats and contributors in parallel
        const [stats, topContributors] = await Promise.all([
          fetchRepoStats(repoName),
          fetchTopContributors(repoName, 5)
        ]);

        setRepoStats(stats);
        setContributors(topContributors);
      } catch (err) {
        console.error('Error fetching GitHub stats or contributors:', err);
        setStatsError('Failed to load GitHub stats or contributors.');
        setRepoStats(null); // Clear potentially stale data
        setContributors([]);
      } finally {
        setStatsLoading(false);
      }
    }

    loadStatsAndContributors();
  }, [repoName]); // Only refetch when repoName changes

  // Removed mock functions for fetching context

  // Display loading indicator for stats if stats are loading
  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-zinc-400">Loading GitHub stats...</p>
      </div>
    );
  }

  // Display error for stats if stats fetching failed
  if (statsError) {
    return (
      <div className="bg-zinc-900/60 p-6 rounded-lg border border-zinc-800/50 text-center">
        <p className="text-zinc-300">{statsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid - Only show if stats loaded successfully */}
      {repoStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-800/50 flex flex-col items-center text-center">
            <Star className="h-6 w-6 text-yellow-400 mb-2" />
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              {repoStats?.stars || 0}
            </div>
            <p className="text-zinc-400 text-sm">Stars</p>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-800/50 flex flex-col items-center text-center">
            <GitFork className="h-6 w-6 text-blue-400 mb-2" />
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              {repoStats?.forks || 0}
            </div>
            <p className="text-zinc-400 text-sm">Forks</p>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-800/50 flex flex-col items-center text-center">
            <GitCommit className="h-6 w-6 text-emerald-400 mb-2" />
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              {repoStats?.commits || 0}
            </div>
            <p className="text-zinc-400 text-sm">Commits</p>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-800/50 flex flex-col items-center text-center">
            <GitPullRequest className="h-6 w-6 text-purple-400 mb-2" />
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              {repoStats?.pullRequests || 0}
            </div>
            <p className="text-zinc-400 text-sm">Pull Requests</p>
          </div>
        </div>
      )}

      {/* Documentation Section (formerly Context Section) */}
      <div className="bg-zinc-900/60 p-6 rounded-lg border border-zinc-800/50">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
          Generated Documentation
        </h3>

        {/* Display Context Options Used */}
        <div className="flex flex-wrap gap-2 mb-4">
          {contextOptions?.includeReadme && (
            <div className="bg-blue-900/30 text-blue-300 border-blue-800 px-2 py-1 rounded-md text-xs flex items-center">
              <BookOpen className="h-3 w-3 mr-1" /> README
            </div>
          )}
          {contextOptions?.includeSourceCode && (
            <div className="bg-emerald-900/30 text-emerald-300 border-emerald-800 px-2 py-1 rounded-md text-xs flex items-center">
              <Code className="h-3 w-3 mr-1" /> Source Code
            </div>
          )}
          {contextOptions?.includeIssues && (
            <div className="bg-yellow-900/30 text-yellow-300 border-yellow-800 px-2 py-1 rounded-md text-xs flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" /> Issues
            </div>
          )}
          {contextOptions?.includePullRequests && (
            <div className="bg-purple-900/30 text-purple-300 border-purple-800 px-2 py-1 rounded-md text-xs flex items-center">
              <GitPullRequest className="h-3 w-3 mr-1" /> PRs
            </div>
          )}
          {!contextOptions?.includeReadme && !contextOptions?.includeSourceCode && !contextOptions?.includeIssues && !contextOptions?.includePullRequests && (
             <p className="text-zinc-400 text-sm italic">No context options were selected for generation.</p>
          )}
        </div>

        {/* Display Loading, Error, or Documentation */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6 ">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-3" />
            <p className="text-zinc-400">Generating documentation...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800/50 text-red-300 p-4 rounded-md text-sm">
            <p className="font-medium">Error generating documentation:</p>
            <p>{error}</p>
          </div>
        ) : documentation ? (
          <div className="bg-zinc-800/50 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm whitespace-pre-wrap">
            {documentation}
          </div>
        ) : (
           <p className="text-zinc-500 text-sm italic">No documentation generated.</p>
        )}
      </div>

      {/* Contributors Section - Only show if contributors loaded successfully */}
      {contributors.length > 0 && (
        <div className="bg-zinc-900/60 p-6 rounded-lg border border-zinc-800/50">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Top Contributors
          </h3>

          <div className="flex flex-wrap gap-4">
            {contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 rounded-md hover:bg-zinc-700/50 transition-colors"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-zinc-200 font-medium">{contributor.login}</p>
                  <p className="text-zinc-400 text-xs">{contributor.contributions} contributions</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated Footer - Only show if stats loaded */}
      {repoStats && (
        <p className="text-center text-zinc-500 text-sm">
          Stats last updated: {new Date(repoStats?.lastUpdated || Date.now()).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
