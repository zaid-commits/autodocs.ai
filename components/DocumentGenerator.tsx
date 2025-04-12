"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  GitFork, 
  Github, 
  Loader2, 
  Info, 
  FileText, 
  BookOpen, 
  Code, 
  History, 
  Clock, 
  Trash, 
  Download, 
  Share2,
  Sparkles,
  Settings,
  BookMarked,
  Database,
  FileCode,
  Layers,
  FolderTree
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function DocumentGenerator() {
    const [repoUrl, setRepoUrl] = useState("");
    const [documentationType, setDocumentationType] = useState("summary");
    const [generatedDocs, setGeneratedDocs] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [recentRepos, setRecentRepos] = useState<string[]>([]);
    const [branch, setBranch] = useState("main");
    const [excludeNodeModules, setExcludeNodeModules] = useState(true);
    const [includeAssets, setIncludeAssets] = useState(false);
    const [fileFilter, setFileFilter] = useState("all");
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [activeTab, setActiveTab] = useState("generator");
    
    // Load recent repos from localStorage
    useEffect(() => {
        const savedRepos = localStorage.getItem('recentRepos');
        if (savedRepos) {
            setRecentRepos(JSON.parse(savedRepos));
        }
    }, []);
    
    // Save repo to recent list
    const saveToRecent = (url: string) => {
        if (!url || recentRepos.includes(url)) return;
        
        const updatedRepos = [url, ...recentRepos.slice(0, 4)];
        setRecentRepos(updatedRepos);
        localStorage.setItem('recentRepos', JSON.stringify(updatedRepos));
    };
    
    // Clear recent repos
    const clearRecentRepos = () => {
        setRecentRepos([]);
        localStorage.removeItem('recentRepos');
        toast.success("Recent repositories cleared");
    };

    // Simulated progress
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + Math.floor(Math.random() * 10);
                });
            }, 800);
            
            return () => {
                clearInterval(interval);
                setLoadingProgress(0);
            };
        }
    }, [loading]);

    const handleSubmit = async () => {
        if (!repoUrl.trim()) {
            toast.error("Please enter a GitHub repository URL");
            return;
        }
        
        if (!repoUrl.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/)) {
            toast.error("Please enter a valid GitHub repository URL");
            return;
        }
        
        setLoading(true);
        setError("");
        setGeneratedDocs("");
        
        try {
            saveToRecent(repoUrl);
            
            // Add a small delay to show progress animation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const response = await fetch("/api/generate-docs-from-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    repoUrl, 
                    documentationType,
                    branch,
                    excludeNodeModules,
                    includeAssets,
                    fileFilter
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to generate documentation.");
                toast.error("Documentation generation failed");
            } else {
                const data = await response.json();
                setGeneratedDocs(data.documentation);
                setActiveTab("results");
                toast.success("Documentation generated successfully");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedDocs) return;
        
        const blob = new Blob([generatedDocs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentationType}_documentation.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Documentation downloaded");
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedDocs);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="space-y-8">
            <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto bg-zinc-900/50 rounded-lg border border-zinc-800/30">
                    <TabsTrigger 
                        value="generator" 
                        className="py-3 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-blue-400 transition-all"
                    >
                        <Sparkles className="h-4 w-4 mr-2" /> Generator
                    </TabsTrigger>
                    <TabsTrigger 
                        value="results" 
                        disabled={!generatedDocs} 
                        className="py-3 data-[state=active]:bg-zinc-800/50 data-[state=active]:text-green-400 transition-all"
                    >
                        <FileText className="h-4 w-4 mr-2" /> Results
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="generator" className="space-y-6">
                    <Card className="border-zinc-800/50 bg-zinc-900/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-b from-zinc-800/50 to-transparent pb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Github className="h-5 w-5 text-blue-400" />
                                <CardTitle>Repository Documentation Generator</CardTitle>
                            </div>
                            <CardDescription className="text-zinc-400">
                                Generate comprehensive documentation for any GitHub repository
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="repoUrl" className="text-zinc-300 flex items-center">
                                    GitHub Repository URL
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 ml-2 text-zinc-500" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-800 border-zinc-700">
                                                <p>Enter the full URL to a GitHub repository</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="repoUrl"
                                        placeholder="e.g., https://github.com/facebook/react"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                                    />
                                    {recentRepos.length > 0 && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="border-zinc-700 hover:bg-zinc-800"
                                                        onClick={() => setRepoUrl(recentRepos[0])}
                                                    >
                                                        <History className="h-4 w-4 text-zinc-400" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-zinc-800 border-zinc-700">
                                                    <p>Use most recent repository</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                            
                            {recentRepos.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-zinc-300">Recent Repositories</Label>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-zinc-500 hover:text-zinc-300"
                                            onClick={clearRecentRepos}
                                        >
                                            <Trash className="h-3 w-3 mr-1" /> Clear
                                        </Button>
                                    </div>
                                    <div className="grid gap-2">
                                        {recentRepos.map((repo, index) => (
                                            <Button 
                                                key={index} 
                                                variant="outline" 
                                                className="justify-start border-zinc-800 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-800"
                                                onClick={() => setRepoUrl(repo)}
                                            >
                                                <Github className="h-3.5 w-3.5 mr-2 text-blue-400" />
                                                <span className="truncate">{repo.replace('https://github.com/', '')}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="docType" className="text-zinc-300 flex items-center">
                                        Documentation Type
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 ml-2 text-zinc-500" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-zinc-800 border-zinc-700">
                                                    <p>Select the type of documentation you want to generate</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Select 
                                        value={documentationType}
                                        onValueChange={(value) => setDocumentationType(value)}
                                    >
                                        <SelectTrigger id="docType" className="bg-zinc-800/50 border-zinc-700 text-white">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                            <SelectItem value="summary" className="focus:bg-zinc-700 focus:text-white">
                                                <div className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                                                    Summary
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="explanation" className="focus:bg-zinc-700 focus:text-white">
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 mr-2 text-green-400" />
                                                    Detailed Explanation
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="api documentation" className="focus:bg-zinc-700 focus:text-white">
                                                <div className="flex items-center">
                                                    <Code className="h-4 w-4 mr-2 text-purple-400" />
                                                    API Documentation
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="getting started" className="focus:bg-zinc-700 focus:text-white">
                                                <div className="flex items-center">
                                                    <BookMarked className="h-4 w-4 mr-2 text-yellow-400" />
                                                    Getting Started Guide
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="architecture" className="focus:bg-zinc-700 focus:text-white">
                                                <div className="flex items-center">
                                                    <Layers className="h-4 w-4 mr-2 text-red-400" />
                                                    Architecture Overview
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="data model" className="focus:bg-zinc-700 focus:text-white">
                                                <div className="flex items-center">
                                                    <Database className="h-4 w-4 mr-2 text-cyan-400" />
                                                    Data Model
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="branch" className="text-zinc-300">Branch Name</Label>
                                    <Input
                                        id="branch"
                                        placeholder="main"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="border-t border-zinc-800/50 pt-6 pb-2">
                                <h3 className="text-zinc-300 mb-4 font-medium flex items-center">
                                    <Settings className="h-4 w-4 mr-2 text-zinc-400" />
                                    Advanced Options
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="exclude-node-modules"
                                            checked={excludeNodeModules}
                                            onCheckedChange={setExcludeNodeModules}
                                        />
                                        <Label htmlFor="exclude-node-modules" className="text-zinc-300">
                                            Exclude node_modules
                                        </Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="include-assets"
                                            checked={includeAssets}
                                            onCheckedChange={setIncludeAssets}
                                        />
                                        <Label htmlFor="include-assets" className="text-zinc-300">
                                            Include assets and static files
                                        </Label>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Filter Files</Label>
                                        <RadioGroup 
                                            value={fileFilter} 
                                            onValueChange={setFileFilter}
                                            className="flex flex-wrap gap-2"
                                        >
                                            <div className="flex items-center space-x-2 bg-zinc-800/30 px-3 py-2 rounded-md">
                                                <RadioGroupItem value="all" id="all" className="border-zinc-600" />
                                                <Label htmlFor="all" className="text-zinc-300">All Files</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-zinc-800/30 px-3 py-2 rounded-md">
                                                <RadioGroupItem value="code" id="code" className="border-zinc-600" />
                                                <Label htmlFor="code" className="text-zinc-300">Code Only</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-zinc-800/30 px-3 py-2 rounded-md">
                                                <RadioGroupItem value="docs" id="docs" className="border-zinc-600" />
                                                <Label htmlFor="docs" className="text-zinc-300">Documentation Files</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        
                        <CardFooter className="flex flex-col gap-4 border-t border-zinc-800/50 pt-6 mt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 shadow-lg shadow-blue-900/20 h-12"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating... {loadingProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Documentation
                                    </>
                                )}
                            </Button>
                            
                            {loading && (
                                <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden mt-2">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                                        style={{ width: `${loadingProgress}%` }}
                                    ></div>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                    
                    {error && (
                        <Card className="border-red-900/30 bg-red-900/10 shadow-md">
                            <CardContent className="pt-6">
                                <p className="text-red-400 text-center">
                                    {error}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                
                <TabsContent value="results" className="space-y-4">
                    {generatedDocs && (
                        <Card className="border-blue-900/30 bg-zinc-900/50 shadow-xl">
                            <CardHeader className="bg-gradient-to-b from-zinc-800/50 to-transparent pb-8 flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge className="bg-green-700">Success</Badge> 
                                        Generated Documentation
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400 mt-2">
                                        Repository: {repoUrl.replace('https://github.com/', '')}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-zinc-700 hover:bg-zinc-800"
                                                    onClick={copyToClipboard}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-800 border-zinc-700">
                                                <p>Copy to clipboard</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-zinc-700 hover:bg-zinc-800"
                                                    onClick={handleDownload}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-800 border-zinc-700">
                                                <p>Download as markdown</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                <div className="bg-zinc-800/70 p-6 rounded-lg border border-zinc-700/50 max-h-[600px] overflow-y-auto">
                                    <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300">{generatedDocs}</pre>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="flex justify-between pt-6 border-t border-zinc-800/50 mt-6">
                                <Button 
                                    variant="outline" 
                                    className="border-zinc-700 hover:bg-zinc-800"
                                    onClick={() => setActiveTab("generator")}
                                >
                                    <FolderTree className="h-4 w-4 mr-2" />
                                    Generate Another
                                </Button>
                                
                                <Button 
                                    className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500"
                                    onClick={handleDownload}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Documentation
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}