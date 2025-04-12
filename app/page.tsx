'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Layers,
  Users,
  CheckCircle2,
  Code2,
  GitMerge,
  Menu,
  Github,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GitHubStats from "@/components/GitHubStats";
import GitHubRepoInfo from "@/components/GitHubRepoInfo";

const Page = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header/Navigation - Improved with mobile responsiveness */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 py-4 backdrop-blur-lg bg-zinc-950/80">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              AutoDocs.AI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Blog
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex text-zinc-400 "
            >
              Log In
            </Button>
            <Button size="sm" className="hidden md:inline-flex">
              Sign Up
            </Button>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Decorative elements with improved positioning and styling */}
          <div
            aria-hidden="true"
            className="absolute top-40 left-1/4 w-72 h-72 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"
          ></div>
          <div
            aria-hidden="true"
            className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"
          ></div>

          {/* Hero Section - Improved layout and spacing */}
          <section className="flex flex-col items-center text-center relative z-10 mb-24 md:mb-32 max-w-3xl mx-auto pt-8 md:pt-12">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Badge className="px-3 py-1 text-xs bg-blue-900/30 text-blue-300 border-blue-800">
                Just Released
              </Badge>
              <Badge className="px-3 py-1 text-xs bg-transparent border border-zinc-700 text-zinc-400">
                v1.0.0
              </Badge>
              <Badge className="px-3 py-1 text-xs bg-emerald-900/30 text-emerald-300 border-emerald-800">
                <Github className="h-3 w-3 mr-1" /> Open Source
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 md:mb-8 tracking-tight leading-tight">
              The modern{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                documentation
              </span>{" "}
              platform for developers
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 mb-10 md:mb-12 leading-relaxed max-w-2xl">
              Automate your documentation workflow with AI. Generate, organize,
              and maintain technical documentation effortlessly.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="group h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/20"
              >
                Start for Free{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-zinc-700 hover:border-zinc-500 text-black hover:bg-gray-400"
                onClick={() =>
                  window.open(
                    "https://github.com/zaid-commits/autodocs.ai",
                    "_blank"
                  )
                }
              >
                <Github className="mr-2 h-5 w-5" /> Star on GitHub
              </Button>
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-800/50 w-full flex justify-center">
              <div className="flex flex-col sm:flex-row gap-6 md:gap-10 items-center text-sm text-zinc-400">
                <p className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" /> No
                  credit card required
                </p>
                <p className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" /> 14-day
                  free trial
                </p>
                <p className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" /> Cancel
                  anytime
                </p>
              </div>
            </div>
          </section>

          {/* Feature Highlights - Improved grid layout and card design */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24 md:mb-32">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-colors shadow-lg">
              <div className="rounded-full bg-blue-900/20 p-3 w-fit mb-5">
                <Code2 className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Smart Documentation
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Automatically extract and generate documentation from your
                codebase with AI assistance.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-colors shadow-lg">
              <div className="rounded-full bg-purple-900/20 p-3 w-fit mb-5">
                <GitMerge className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Version Control</h3>
              <p className="text-zinc-400 leading-relaxed">
                Keep documentation in sync with your code through automatic
                updates when you commit changes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-colors shadow-lg">
              <div className="rounded-full bg-emerald-900/20 p-3 w-fit mb-5">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-zinc-400 leading-relaxed">
                Work together seamlessly with role-based access control and
                real-time collaborative editing.
              </p>
            </div>
          </section>

          {/* Features Tabs - Improved layout and visual feedback */}
          <section className="max-w-5xl mx-auto mb-28 md:mb-36">
            <div className="text-center mb-16">
              <Badge className="mb-4 text-white" variant="outline">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Everything you need in one platform
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Discover how AutoDocs.AI transforms your documentation process
                from a tedious task to a seamless experience.
              </p>
            </div>

            <Tabs defaultValue="automation" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-3 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/30 w-full max-w-md">
                  <TabsTrigger
                    value="automation"
                    className="py-3 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-blue-400 transition-all"
                  >
                    Automation
                  </TabsTrigger>
                  <TabsTrigger
                    value="integration"
                    className="py-3 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-purple-400 transition-all"
                  >
                    Integration
                  </TabsTrigger>
                  <TabsTrigger
                    value="collaboration"
                    className="py-3 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-emerald-400 transition-all"
                  >
                    Collaboration
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Automation Tab Content */}
              <TabsContent value="automation" className="space-y-4">
                <Card className="border-blue-900/20 bg-zinc-900/50 overflow-hidden shadow-xl">
                  <div className="md:grid md:grid-cols-2">
                    <div className="p-8">
                      <CardHeader className="px-0 pt-0">
                        <div className="mb-5 flex items-center">
                          <div className="rounded-full bg-blue-500/10 p-2 mr-3">
                            <Zap className="h-5 w-5 text-blue-500" />
                          </div>
                          <CardTitle className="text-xl text-blue-500">
                            AI-Powered Documentation
                          </CardTitle>
                        </div>
                        <CardDescription className="text-zinc-400 text-base">
                          Let our advanced AI handle your documentation needs
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="px-0 pb-0 mt-6">
                        <ul className="space-y-5">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Automatic code documentation generation
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Contextual suggestions based on your codebase
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Intelligent formatting and organization
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </div>
                    <div className="bg-zinc-900 p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-zinc-800">
                      <div className="h-full w-full rounded-xl border border-zinc-800 overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-zinc-500 text-sm">
                            Feature illustration
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Integration Tab Content */}
              <TabsContent value="integration" className="space-y-4">
                <Card className="border-purple-900/30 bg-zinc-900/50 overflow-hidden shadow-xl shadow-purple-900/5">
                  <div className="md:grid md:grid-cols-2">
                    <div className="p-6 md:p-8">
                      <CardHeader className="px-0 pt-0">
                        <div className="mb-4 flex items-center">
                          <Layers className="h-5 w-5 mr-2 text-purple-400" />
                          <CardTitle className="text-purple-400">
                            Seamless Ecosystem Integration
                          </CardTitle>
                        </div>
                        <CardDescription className="text-zinc-400">
                          Works with your existing development tools
                        </CardDescription>
                      </CardHeader>
                      <CardContent className=" px-0 pb-0 mt-6">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              GitHub, GitLab, and Bitbucket integration
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              API endpoints for custom workflows
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Compatible with all major programming languages
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </div>
                    <div className="bg-zinc-800 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-zinc-700/50">
                      <div className="h-full w-full bg-zinc-800 rounded-lg border border-zinc-700/50 overflow-hidden">
                        <div className="h-64 bg-zinc-800 flex items-center justify-center">
                          <p className="text-zinc-500 text-sm">
                            Integration diagram
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Collaboration Tab Content */}
              <TabsContent value="collaboration" className="space-y-4">
                <Card className="border-emerald-900/30 bg-zinc-900/50 overflow-hidden shadow-xl shadow-emerald-900/5">
                  <div className="md:grid md:grid-cols-2">
                    <div className="p-6 md:p-8">
                      <CardHeader className="px-0 pt-0 ">
                        <div className="mb-4 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-emerald-400" />
                          <CardTitle>Real-Time Team Collaboration</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-400">
                          Work together with your team effortlessly
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Real-time collaborative editing
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Comment and review system
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-zinc-300">
                              Role-based access control
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </div>
                    <div className="bg-zinc-800 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-zinc-700/50">
                      <div className="h-full w-full bg-zinc-800 rounded-lg border border-zinc-700/50 overflow-hidden">
                        <div className="h-64 bg-zinc-800 flex items-center justify-center">
                          <p className="text-zinc-500 text-sm">
                            Collaboration interface
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* GitHub Repository Information */}
          <section id="github" className="max-w-5xl mx-auto mb-16 md:mb-24">
            <div className="text-center mb-12">
              <Badge className="mb-4 text-white" variant="outline">
                <Github className="h-3.5 w-3.5 mr-1.5" /> Open Source
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Join our open-source community
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                AutoDocs.AI is built in the open with contributions from
                developers around the world. Help us improve and shape the
                future of documentation automation.
              </p>
            </div>

            <GitHubRepoInfo
              repoName="autodocs.ai"
              repoOwner="zaid-commits"
              description="Open-source AI-powered documentation automation platform that helps developers create and maintain high-quality documentation with minimal effort."
            />

            <div className="mt-12">
              <GitHubStats />
            </div>

            {/* Contribution CTA */}
            <div className="bg-gradient-to-br from-zinc-900/70 to-zinc-950/90 mt-12 p-8 rounded-xl border border-zinc-800/50 text-center">
              <h3 className="text-xl font-semibold mb-4">
                Ready to contribute?
              </h3>
              <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
                We welcome contributions of all sizes, from fixing typos to
                implementing major features.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() =>
                    window.open(
                      "https://github.com/zaid-commits/autodocs.ai/issues",
                      "_blank"
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  View Open Issues
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://github.com/zaid-commits/autodocs.ai/blob/main/CONTRIBUTING.md",
                      "_blank"
                    )
                  }
                  className="border-zinc-700 text-black hover:bg-gray-400 font-medium"
                >
                  Read Contribution Guide
                </Button>
              </div>
            </div>
          </section>

          {/* Call-to-action section - Improved visual appeal */}
          <section className="rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 p-8 md:p-12 text-center max-w-4xl mx-auto mb-20 shadow-2xl shadow-zinc-900/50">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              Ready to transform your documentation process?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers who are saving time and improving
              their documentation with AutoDocs.AI
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/20"
              >
                Get Started for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-zinc-700 hover:border-zinc-500 text-black"
              >
                Schedule a Demo
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer - Improved organization and styling */}
      <footer className="border-t border-zinc-800/80 py-16 bg-zinc-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 lg:gap-16">
            <div>
              <h3 className="font-bold mb-5 text-lg text-white">Product</h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="#features"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-lg text-white">Resources</h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="#documentation"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#documentation"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#documentation"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-lg text-white">Company</h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#blog"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-lg text-white">Legal</h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white text-sm hover:underline transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2.5 mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-900/30">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white">AutoDocs.AI</span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Simplifying documentation for developers
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <div className="flex space-x-4">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="GitHub"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} AutoDocs.AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
