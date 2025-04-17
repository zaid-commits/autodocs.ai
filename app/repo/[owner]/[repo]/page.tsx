'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GitHubRepoInfo from '@/components/GitHubRepoInfo';
import { Loader2 } from 'lucide-react';
// Removed local GitHubStats definition to avoid conflict
import GitHubStats from '@/components/GitHubStats'; // Ensure GitHubStats component accepts the documentation prop

// Define the structure for context options if not already defined globally
interface ContextOptions {
    includeReadme: boolean;
    includeSourceCode: boolean;
    includeIssues: boolean;
    includePullRequests: boolean;
}

interface GitHubStatsProps {
    repoName: string;
    contextOptions: ContextOptions | null;
    documentation: string; // Added documentation prop
    isLoading: boolean;
    error: string | null;
}

// Removed unused GitHubStatsProps interface and unused state

const RepoPage = () => {
    const params = useParams();
    const owner = decodeURIComponent(params?.owner as string);
    const repo = decodeURIComponent(params?.repo as string);
    const [contextOptions, setContextOptions] = useState<ContextOptions | null>(null);
    const [generatedDocs, setGeneratedDocs] = useState<string>('');
    const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
    const [docsError, setDocsError] = useState<string | null>(null);

    useEffect(() => {
        // Retrieve context options from localStorage
        try {
            const storedOptions = localStorage.getItem('repoContextOptions');
            if (storedOptions) {
                setContextOptions(JSON.parse(storedOptions));
            } else {
                // Set default options if none found in localStorage
                setContextOptions({
                    includeReadme: true,
                    includeSourceCode: true,
                    includeIssues: false,
                    includePullRequests: false
                });
            }
        } catch (error) {
            console.error('Error retrieving context options:', error);
            setDocsError('Failed to load context settings.');
             // Set default options on error
             setContextOptions({
                includeReadme: true,
                includeSourceCode: true,
                includeIssues: false,
                includePullRequests: false
            });
        }
    }, []); // Run only once on mount to get options

    useEffect(() => {
        // Fetch documentation when owner, repo, and contextOptions are available
        if (owner && repo && contextOptions) {
            const fetchDocumentation = async () => {
                setIsLoadingDocs(true);
                setDocsError(null);
                setGeneratedDocs(''); // Clear previous docs

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
                            // Assuming backend uses contextOptions, adjust if needed
                            // documentationType: "README.md" // Or derive from options/UI
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `API request failed with status ${response.status}`);
                    }

                    const result = await response.json();
                    setGeneratedDocs(result.documentation);

                } catch (err) {
                    console.error("Error fetching documentation:", err);
                    setDocsError(err instanceof Error ? err.message : 'Failed to fetch documentation.');
                } finally {
                    setIsLoadingDocs(false);
                }
            };

            fetchDocumentation();
        }
    }, [owner, repo, contextOptions]); // Re-run if owner, repo, or options change

    if (!owner || !repo) {
        // Initial loading state before params are resolved
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> {/* Changed to 3 columns */}
                    {/* Left Side: Repository Info */}
                    <div className="md:col-span-1"> {/* Takes 1 column */}
                        <GitHubRepoInfo
                            repoName={repo}
                            repoOwner={owner}
                            description="Loading repository details..."
                        />
                    </div>

                    {/* Right Side: Repository Context & Stats */}
                    <div className="md:col-span-2"> {/* Takes 2 columns */}
                        <GitHubStats
                            repoName={`${owner}/${repo}`} // Pass repoName if still needed by GitHubStats
                            contextOptions={contextOptions}
                            documentation={generatedDocs}
                            isLoading={isLoadingDocs}
                            error={docsError}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RepoPage;