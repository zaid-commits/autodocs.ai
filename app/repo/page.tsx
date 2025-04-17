'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This is the base /repo page - it redirects to /generate
export default function RepoPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to generate page
        router.replace('/generate');
    }, [router]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
            <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-zinc-400">Redirecting to documentation generator...</p>
            </div>
        </div>
    );
}