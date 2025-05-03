import React, { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Star, Loader2, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ContextOptions {
    includeReadme: boolean;
    includeSourceCode: boolean;
    includeIssues: boolean;
    includePullRequests: boolean;
    quickMode: boolean;
    customPrompt: string;
}

interface PopularRepo {
    name: string;
    description: string;
    stars: string;
    language: string;
}

const Placeholder: React.FC = () => {
    const [repoUrl, setRepoUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [contextOptions, setContextOptions] = useState<ContextOptions>({
        includeReadme: true,
        includeSourceCode: true,
        includeIssues: false,
        includePullRequests: false,
        quickMode: true,
        customPrompt: ''
    });
    const router = useRouter();

    const popularRepos: PopularRepo[] = [
        { 
            name: 'vercel/next.js', 
            description: 'The React Framework for the Web', 
            stars: '114k',
            language: 'JavaScript'
        },
        { 
            name: 'facebook/react', 
            description: 'A JavaScript library for building user interfaces', 
            stars: '213k',
            language: 'JavaScript'
        },
        { 
            name: 'microsoft/vscode', 
            description: 'Code editor redefined and optimized for building and debugging', 
            stars: '152k',
            language: 'TypeScript'
        },
        { 
            name: 'openai/openai-cookbook', 
            description: 'Examples and guides for using the OpenAI API', 
            stars: '48k',
            language: 'Jupyter Notebook'
        }
    ];

    const handleOptionChange = (option: keyof ContextOptions): void => {
        setContextOptions({
            ...contextOptions,
            [option]: !contextOptions[option]
        });
    };
    
    const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setContextOptions({
            ...contextOptions,
            customPrompt: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        
        try {
            if (!repoUrl.trim()) {
                throw new Error('Please enter a GitHub repository URL');
            }

            // Extract repo owner and name from URL
            let repoOwner: string;
            let repoName: string;
            
            // Check if it's a GitHub URL
            const githubUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\s]+)\/?/i;
            const githubMatch = repoUrl.match(githubUrlPattern);
            
            if (githubMatch && githubMatch[1] && githubMatch[2]) {
                // It's a GitHub URL
                repoOwner = githubMatch[1];
                repoName = githubMatch[2].replace(/\/$/, '').trim();
            } else {
                // Check if it's just a username/repo format
                const simpleRepoPattern = /^([^\/\s]+)\/([^\/\s]+)$/;
                const simpleMatch = repoUrl.match(simpleRepoPattern);
                
                if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
                    repoOwner = simpleMatch[1];
                    repoName = simpleMatch[2];
                } else {
                    throw new Error('Invalid GitHub repository format. Please use "username/repository" or a complete GitHub URL');
                }
            }
            
            // Store context options in localStorage before navigation
            localStorage.setItem('repoContextOptions', JSON.stringify(contextOptions));
            
            // Redirect to the repo page with the owner and repo name
            setIsLoading(true);
            router.push(`/repo/${repoOwner}/${repoName}`);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsLoading(false);
        }
    };

    const handleRepoCardClick = (repoName: string): void => {
        // Parse owner/repo from the string
        const [owner, repo] = repoName.split('/');
        if (!owner || !repo) return;
        
        setRepoUrl(`${owner}/${repo}`);
        
        // Store context options in localStorage
        localStorage.setItem('repoContextOptions', JSON.stringify(contextOptions));
        
        // Redirect to the repo page
        setIsLoading(true);
        router.push(`/repo/${owner}/${repo}`);
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-3xl mx-auto my-16 flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-8 shadow-lg mb-6 flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-6" />
                    <h2 className="text-xl font-semibold text-white mb-2">Redirecting to documentation...</h2>
                    <p className="text-zinc-400 text-center mb-4">Please wait while we prepare your request</p>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-2">
                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto my-8 ">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        Enter GitHub Repository URL
                    </h2>
                    
                    <div className="flex items-center border border-zinc-700 rounded-lg px-4 py-2 bg-zinc-800/50 shadow-sm">
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repository or username/repository"
                            className="flex-1 border-none focus:outline-none text-base py-2 bg-transparent text-white"
                            disabled={isLoading}
                        />
                        <Button 
                            type="submit"
                            className="flex items-center gap-2"
                            disabled={isLoading || !repoUrl.trim()}
                            variant="default"
                        >
                            Generate
                        </Button>
                    </div>
                    {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-medium text-zinc-300">Context Options</h3>
                            
                            <div className="flex items-center gap-2">
                                <Label htmlFor="quickMode" className="text-sm text-zinc-400">Quick Mode</Label>
                                <Switch
                                    id="quickMode"
                                    checked={contextOptions.quickMode}
                                    onCheckedChange={() => handleOptionChange('quickMode')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                                <span className="text-xs text-zinc-500">Faster results</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Checkbox
                                    id="readme"
                                    checked={contextOptions.includeReadme}
                                    onCheckedChange={() => handleOptionChange('includeReadme')}
                                    className="data-[state=checked]:bg-blue-600 border-zinc-600"
                                />
                                <Label htmlFor="readme" className="ml-2 text-sm text-zinc-300">Include README</Label>
                            </div>
                            <div className="flex items-center">
                                <Checkbox
                                    id="sourceCode"
                                    checked={contextOptions.includeSourceCode}
                                    onCheckedChange={() => handleOptionChange('includeSourceCode')}
                                    className="data-[state=checked]:bg-emerald-600 border-zinc-600"
                                />
                                <Label htmlFor="sourceCode" className="ml-2 text-sm text-zinc-300">Include Source Code</Label>
                            </div>
                            <div className="flex items-center">
                                <Checkbox
                                    id="issues"
                                    checked={contextOptions.includeIssues}
                                    onCheckedChange={() => handleOptionChange('includeIssues')}
                                    className="data-[state=checked]:bg-yellow-600 border-zinc-600"
                                />
                                <Label htmlFor="issues" className="ml-2 text-sm text-zinc-300">Include Issues</Label>
                            </div>
                            <div className="flex items-center">
                                <Checkbox
                                    id="pullRequests"
                                    checked={contextOptions.includePullRequests}
                                    onCheckedChange={() => handleOptionChange('includePullRequests')}
                                    className="data-[state=checked]:bg-purple-600 border-zinc-600"
                                />
                                <Label htmlFor="pullRequests" className="ml-2 text-sm text-zinc-300">Include Pull Requests</Label>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="customPrompt" className="text-sm text-zinc-300">Custom Prompt</Label>
                            <textarea
                                id="customPrompt"
                                value={contextOptions.customPrompt}
                                onChange={handleCustomPromptChange}
                                placeholder="Enter custom instructions for the documentation generation..."
                                className="w-full mt-2 p-2 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white focus:outline-none"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Popular Repositories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {popularRepos.map((repo) => (
                            <Card 
                                key={repo.name} 
                                className="cursor-pointer bg-zinc-900/80 border-zinc-800/50 hover:border-zinc-700 transition-colors shadow-lg" 
                                onClick={() => handleRepoCardClick(repo.name)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        {repo.name}
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">{repo.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="flex justify-between items-center pt-2 border-t border-zinc-800">
                                    <Badge className="bg-zinc-800 text-zinc-300">{repo.language}</Badge>
                                    <div className="flex items-center text-zinc-400 text-sm">
                                        <Star className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                                        {repo.stars}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Placeholder;
