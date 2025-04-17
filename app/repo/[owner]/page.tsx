'use client'

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const LegacyRepoPage = () => {
    const params = useParams();
    const owner = params?.owner as string; // Updated parameter name
    const repo = params?.repo as string; // Updated parameter name
    const router = useRouter();

    useEffect(() => {
        if (!owner) return;

        // Handle legacy URL format and redirect to the new structure
        const processRepoName = () => {
            if (owner.includes('/')) {
                const parts = owner.split('/');
                if (parts[0].includes('github.com') || parts[0].includes('http')) {
                    const ownerParam = encodeURIComponent(parts[1]);
                    const repo = encodeURIComponent(parts[2]);
                    router.replace(`/repo/${ownerParam}/${repo}`);
                    return;
                }
            }
            router.replace('/generate');
        };

        processRepoName();
    }, [owner, router]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
            <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-zinc-400">Redirecting to repository...</p>
            </div>
        </div>
    );
};

export default LegacyRepoPage;
