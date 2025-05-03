import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitFork, Code, Loader2, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchRepoDetails } from '@/lib/github';

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
    async function loadRepoDetails() {
      try {
        setLoading(true);
        
        // Use the authenticated fetchRepoDetails function instead of raw fetch
        const data = await fetchRepoDetails(repoOwner, repoName);
        
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
      loadRepoDetails();
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
          
          {/* Repository Analytics Section */}
          {repoDetails && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Repository Analytics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-zinc-300">Documentation Quality: 85%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-zinc-300">Code Coverage: 73%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm text-zinc-300">API Completeness: 62%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm text-zinc-300">Readability Score: 91%</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-zinc-700 text-black hover:bg-zinc-700 "
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
              className="flex items-center gap-2 text-black hover:bg-zinc-700 border-zinc-700"
              onClick={() => window.open(`${repoUrl}/fork`, '_blank')}
            >
              <GitFork className="h-4 w-4 text-blue-400" />
              Fork Repo
            </Button>
            
            {/* New Button for Sharing Documentation */}
            <Button 
              variant="default"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500"
              onClick={() => {
                const shareUrl = `${window.location.origin}/share/${repoOwner}/${repoName}`;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Documentation link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4" />
              Copy Doc Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
