'use client'
import DocumentGenerator from '@/components/DocumentGenerator'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Code2, GitPullRequest } from 'lucide-react'

const page = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Decorative elements */}
          <div
            aria-hidden="true"
            className="absolute top-40 left-1/4 w-72 h-72 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"
          ></div>
          <div
            aria-hidden="true"
            className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"
          ></div>

          {/* Header Section */}
          <section className="flex flex-col items-center text-center relative z-10 mb-16 md:mb-20 max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Badge className="px-3 py-1 text-xs bg-blue-900/30 text-blue-300 border-blue-800">
                <GitPullRequest className="h-3 w-3 mr-1" /> Documentation Generator
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Generate{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                documentation
              </span>{" "}
              from repositories
            </h1>

            <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              Automatically extract and generate comprehensive documentation from any GitHub repository with our AI-powered tool.
            </p>
          </section>

          {/* Generator Section */}
          <section className="max-w-3xl mx-auto">
            <DocumentGenerator />
          </section>
        </div>
      </main>
    </div>
  )
}

export default page
