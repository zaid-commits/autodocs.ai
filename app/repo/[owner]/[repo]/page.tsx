'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
    const owner = decodeURIComponent(params?.owner as string);
    const repo = decodeURIComponent(params?.repo as string);
    const [contextOptions] = useState<ContextOptions>({
        includeReadme: true,
        includeSourceCode: true,
        includeIssues: false,
        includePullRequests: false,
    });
    const [generatedDocs, setGeneratedDocs] = useState<string>('');
    const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
    const [docsError, setDocsError] = useState<string | null>(null);
    const [cacheInfo, setCacheInfo] = useState<{ fromCache: boolean; cachedAt?: string }>({
        fromCache: false,
    });
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
                    forceRefresh: forceRefresh // Pass this flag to the API
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
                if (forceRefresh) {
                    toast.info("Using cached documentation - the repository hasn't changed since last generation");
                }
            } else {
                setCacheInfo({ fromCache: false });
                if (forceRefresh) {
                    toast.success("Documentation refreshed successfully");
                }
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

    useEffect(() => {
        if (owner && repo) {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <GitHubRepoInfo
                            repoName={repo}
                            repoOwner={owner}
                            description="Loading repository details..."
                        />
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
                                    className="flex items-center gap-2 border-zinc-700 hover:border-zinc-500"
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
