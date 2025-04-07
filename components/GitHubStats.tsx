"use client";

import React, { useEffect, useState } from 'react';
import { GitHubRepoStats, GitHubContributor, fetchRepoStats, fetchTopContributors } from '@/lib/github';
import { Loader2, Star, GitFork, Users, GitPullRequest, GitCommit } from 'lucide-react';

export default function GitHubStats() {
  const [repoStats, setRepoStats] = useState<GitHubRepoStats | null>(null);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGitHubData() {
      try {
        setLoading(true);
        const [stats, topContributors] = await Promise.all([
          fetchRepoStats(),
          fetchTopContributors(5)
        ]);
        
        setRepoStats(stats);
        setContributors(topContributors);
        setError(null);
      } catch (err) {
        setError('Failed to load GitHub data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadGitHubData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-zinc-400">Loading GitHub stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900/60 p-6 rounded-lg border border-zinc-800/50 text-center">
        <p className="text-zinc-300">Unable to load GitHub data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
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
      
      {/* Contributors Section */}
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
      
      <p className="text-center text-zinc-500 text-sm">
        Last updated: {new Date(repoStats?.lastUpdated || '').toLocaleDateString()}
      </p>
    </div>
  );
}
