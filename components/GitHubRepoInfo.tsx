import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitFork, Code, Loader2 } from 'lucide-react';

interface GitHubRepoInfoProps {
  repoName: string;
  repoOwner: string;
  description: string;
}

export default function GitHubRepoInfo({ 
  repoName, 
  repoOwner, 
  description
}: GitHubRepoInfoProps) {
  const [repoDetails, setRepoDetails] = useState<{
    name: string;
    fullName: string;
    description: string;
    language: string;
    license: string | null;
    isPrivate: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const repoUrl = `https://github.com/${repoOwner}/${repoName}`;
  
  useEffect(() => {
    async function fetchRepoDetails() {
      try {
        setLoading(true);
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch repository details: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setRepoDetails({
          name: data.name,
          fullName: data.full_name,
          description: data.description || description,
          language: data.language,
          license: data.license?.name || null,
          isPrivate: data.private
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching repository details:', err);
        setError('Failed to load repository details');
      } finally {
        setLoading(false);
      }
    }
    
    if (repoOwner && repoName) {
      fetchRepoDetails();
    }
  }, [repoOwner, repoName, description]);

  if (loading) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-lg flex items-center justify-center h-48">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-zinc-400">Loading repository details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-lg">
        <div className="text-center">
          <p className="text-zinc-300 mb-2">Unable to load repository details</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-lg ">
      <div className="flex items-start space-x-4">
        <div className="bg-zinc-800/50 p-3 rounded-lg">
          <Github className="h-8 w-8 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="text-xl font-semibold text-white">{repoOwner}/{repoName}</h3>
            {repoDetails?.isPrivate ? (
              <Badge className="bg-red-900/30 text-red-300 border-red-800">Private</Badge>
            ) : (
              <Badge className="bg-emerald-900/30 text-emerald-300 border-emerald-800">Public</Badge>
            )}
            {repoDetails?.language && (
              <Badge className="bg-blue-900/30 text-blue-300 border-blue-800">{repoDetails.language}</Badge>
            )}
            {repoDetails?.license && (
              <Badge className="bg-purple-900/30 text-purple-300 border-purple-800">{repoDetails.license}</Badge>
            )}
          </div>
          
          <p className="text-zinc-300 mt-2 mb-4">{repoDetails?.description || description}</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-zinc-700 text-white hover:bg-zinc-700"
              onClick={() => window.open(repoUrl, '_blank')}
            >
              <Code className="h-4 w-4" />
              View Code
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => window.open(`${repoUrl}/stargazers`, '_blank')}
            >
              <Star className="h-4 w-4 text-yellow-400" />
              Star Repo
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2 text-white hover:bg-zinc-700 border-zinc-700"
              onClick={() => window.open(`${repoUrl}/fork`, '_blank')}
            >
              <GitFork className="h-4 w-4 text-blue-400" />
              Fork Repo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
