import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Star, GitFork, Code } from 'lucide-react';

interface GitHubRepoInfoProps {
  repoName: string;
  repoOwner: string;
  description: string;
}

export default function GitHubRepoInfo({ 
  repoName = 'autodocs.ai', 
  repoOwner = 'zaid-commits', // Update with actual owner
  description = 'Open source AI-powered documentation automation tool for developers'
}: GitHubRepoInfoProps) {
  
  const repoUrl = `https://github.com/${repoOwner}/${repoName}`;
  
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="bg-zinc-800/50 p-3 rounded-lg">
          <Github className="h-8 w-8 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="text-xl font-semibold text-white">{repoOwner}/{repoName}</h3>
            <Badge className="bg-emerald-900/30 text-emerald-300 border-emerald-800">Open Source</Badge>
          </div>
          
          <p className="text-zinc-300 mt-2 mb-4">{description}</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-zinc-700 text-white hover:bg-zinc-800"
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
              className="flex items-center gap-2 border-zinc-700 text-white hover:bg-zinc-800"
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
