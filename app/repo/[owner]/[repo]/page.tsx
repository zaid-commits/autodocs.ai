'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GitHubRepoInfo from '@/components/GitHubRepoInfo';
import { Loader2, RefreshCw } from 'lucide-react';
import GitHubStats from '@/components/GitHubStats';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContextOptions {
    includeReadme: boolean;
    includeSourceCode: boolean;
    includeIssues: boolean;
    includePullRequests: boolean;
    quickMode: boolean;
    customPrompt: string;
}

interface GitHubStatsProps {
    repoName: string;
    contextOptions: ContextOptions;
    documentation: string;
    isLoading: boolean;
    error: string | null;
    cacheInfo: {
        fromCache: boolean;
        cachedAt?: string;
    };
}

const RepoPage = () => {
    const params = useParams();
    const router = useRouter();
    const owner = decodeURIComponent(params?.owner as string);
    const repo = decodeURIComponent(params?.repo as string);
    const [contextOptions, setContextOptions] = useState<ContextOptions>({
        includeReadme: true,
        includeSourceCode: true,
        includeIssues: false,
        includePullRequests: false,
        quickMode: true,
        customPrompt: '',
    });
    const [generatedDocs, setGeneratedDocs] = useState<string>('');
    const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
    const [docsError, setDocsError] = useState<string | null>(null);
    const [cacheInfo, setCacheInfo] = useState<{ fromCache: boolean; cachedAt?: string }>({
        fromCache: false,
    });
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Load context options from localStorage when component mounts
    useEffect(() => {
        const storedOptions = localStorage.getItem('repoContextOptions');
        if (storedOptions) {
            try {
                const parsedOptions = JSON.parse(storedOptions);
                setContextOptions(parsedOptions);
            } catch (e) {
                console.error('Error parsing stored context options:', e);
            }
        }
    }, []);

    const fetchDocumentation = async (forceRefresh = false) => {
        setIsLoadingDocs(true);
        setDocsError(null);
        if (forceRefresh) {
            setGeneratedDocs('');
            setCacheInfo({ fromCache: false });
        }

        try {
            const repoUrl = `https://github.com/${owner}/${repo}`;
            const response = await fetch('/api/generate-docs-from-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    repoUrl: repoUrl,
                    contextOptions: contextOptions,
                    forceRefresh: forceRefresh
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }

            const result = await response.json();
            setGeneratedDocs(result.documentation);
            
            // Set cache information if available
            if (result.fromCache) {
                setCacheInfo({
                    fromCache: true,
                    cachedAt: result.cachedAt
                });
                console.log("Using cached documentation - the repository hasn't changed since last generation");
            } else {
                setCacheInfo({ fromCache: false });
                console.log("Documentation refreshed successfully");
            }
        } catch (err) {
            console.error('Error fetching documentation:', err);
            setDocsError(err instanceof Error ? err.message : 'Failed to fetch documentation.');
            if (forceRefresh) {
                toast.error("Failed to refresh documentation");
            }
        } finally {
            setIsLoadingDocs(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchDocumentation(true);
    };

    const goBackToGenerator = () => {
        router.push('/generate');
    };

    // Fetch documentation only when owner, repo, and contextOptions are available
    useEffect(() => {
        if (owner && repo && contextOptions) {
            fetchDocumentation();
        }
    }, [owner, repo, contextOptions]);

    if (!owner || !repo) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-zinc-400">Loading repository details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <main className="container mx-auto px-4 py-16">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center">
                        {owner}/{repo}
                    </h1>
                    <Button
                        variant="outline"
                        onClick={goBackToGenerator}
                        className="border-zinc-700 hover:border-zinc-500 text-black bg-zinc-200 hover:bg-zinc-300 cursor-pointer"
                    >
                        Back to Generator
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <GitHubRepoInfo
                            repoName={repo}
                            repoOwner={owner}
                            description="Loading repository details..."
                        />
                        
                        <div className="mt-6 bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-6 shadow-lg">
                            <h3 className="text-xl font-semibold mb-4">Generation Options</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${contextOptions.includeReadme ? 'bg-blue-500' : 'bg-zinc-600'}`}></div>
                                    <span className="text-zinc-300">Include README: {contextOptions.includeReadme ? 'Yes' : 'No'}</span>
                                </li>
                                <li className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${contextOptions.includeSourceCode ? 'bg-emerald-500' : 'bg-zinc-600'}`}></div>
                                    <span className="text-zinc-300">Include Source Code: {contextOptions.includeSourceCode ? 'Yes' : 'No'}</span>
                                </li>
                                <li className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${contextOptions.includeIssues ? 'bg-yellow-500' : 'bg-zinc-600'}`}></div>
                                    <span className="text-zinc-300">Include Issues: {contextOptions.includeIssues ? 'Yes' : 'No'}</span>
                                </li>
                                <li className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${contextOptions.includePullRequests ? 'bg-purple-500' : 'bg-zinc-600'}`}></div>
                                    <span className="text-zinc-300">Include Pull Requests: {contextOptions.includePullRequests ? 'Yes' : 'No'}</span>
                                </li>
                                <li className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${contextOptions.quickMode ? 'bg-blue-500' : 'bg-zinc-600'}`}></div>
                                    <span className="text-zinc-300">Quick Mode: {contextOptions.quickMode ? 'Yes' : 'No'}</span>
                                </li>
                                {contextOptions.customPrompt && (
                                    <li className="mt-4">
                                        <div className="mb-2 font-medium text-zinc-300">Custom Prompt:</div>
                                        <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 whitespace-pre-wrap">
                                            {contextOptions.customPrompt}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Documentation</h2>
                            
                            <div className="flex items-center gap-2">
                                {cacheInfo.fromCache && cacheInfo.cachedAt && (
                                    <span className="text-sm text-zinc-400">
                                        Cached: {new Date(cacheInfo.cachedAt).toLocaleString()}
                                    </span>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={isRefreshing || isLoadingDocs}
                                    onClick={handleRefresh}
                                    className="flex items-center gap-2 border-zinc-700 hover:border-zinc-500 text-black bg-zinc-200 hover:bg-zinc-300 cursor-pointer"
                                >
                                    {isRefreshing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
                            </div>
                        </div>
                        {/* {cacheInfo.fromCache && (
                            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
                                Using cached documentation - the repository hasn't changed since last generatioooon.
                            </div>
                        )} */}
                        <GitHubStats
                            repoName={`${owner}/${repo}`}
                            contextOptions={contextOptions}
                            documentation={generatedDocs}
                            isLoading={isLoadingDocs}
                            error={docsError}
                            cacheInfo={cacheInfo}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RepoPage;
