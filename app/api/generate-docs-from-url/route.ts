// app/api/generate-docs-from-url/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Octokit } from "octokit";

// Configure model with faster response options
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-latest",
  // Add generation config for faster responses
  generationConfig: {
    temperature: 0.2,  // Lower temperature for more focused responses
    maxOutputTokens: 2048, // Limit response size
  }
});

const githubPat = process.env.YOUR_GITHUB_PAT;

// Simple in-memory cache to avoid redundant API calls
const cache = new Map();
// Cache expiration time (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Add timeout for fetching files
const TIMEOUT_MS = 15000; // 15 seconds timeout

async function getRepoFiles(owner: string, repo: string, octokit: Octokit): Promise<string[]> {
  const cacheKey = `files-${owner}-${repo}`;
  
  // Check cache first
  if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp) < CACHE_TTL) {
    return cache.get(cacheKey).data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: "true",
    });
    
    clearTimeout(timeoutId);
    
    if (!data?.tree) {
      return [];
    }
    
    const files = data.tree
      .filter((item) => item.type === "blob")
      .map((item) => item.path);
      
    // Store in cache
    cache.set(cacheKey, { data: files, timestamp: Date.now() });
    return files;
    
  } catch (error: any) {
    console.error(`Error fetching repo files: ${error.message}`);
    return [];
  }
}

async function getFileContent(owner: string, repo: string, path: string, octokit: Octokit): Promise<string | null> {
  const cacheKey = `content-${owner}-${repo}-${path}`;
  
  // Check cache first
  if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp) < CACHE_TTL) {
    return cache.get(cacheKey).data;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      mediaType: {
        format: "raw",
      },
    });
    
    clearTimeout(timeoutId);
    
    if (typeof data === 'string') {
      // Store in cache
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
    return null;
    
  } catch (error: any) {
    console.error(`Error fetching content for ${path}: ${error.message}`);
    return null;
  }
}

// Helper to limit file size and content processed
function trimFileContent(content: string, maxChars = 5000): string {
  if (content.length <= maxChars) return content;
  return content.substring(0, maxChars) + "... [truncated for size]";
}

export async function POST(req: Request): Promise<Response> {
  if (!githubPat) {
    console.error("GitHub Personal Access Token not found in environment variables (YOUR_GITHUB_PAT).");
    return new NextResponse(JSON.stringify({ error: "GitHub Personal Access Token not configured on the server." }), { status: 500 });
  }

  const octokit = new Octokit({ auth: githubPat });
  console.time('documentation-generation');

  try {
    const { repoUrl, contextOptions } = await req.json();

    if (!repoUrl) {
      return new NextResponse(JSON.stringify({ error: "Missing repository URL." }), { status: 400 });
    }

    // Generate a cache key for this specific request
    const optionsKey = JSON.stringify(contextOptions || {});
    const cacheKey = `docs-${repoUrl}-${optionsKey}`;
    
    // Return cached result if available
    if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp) < CACHE_TTL) {
      console.timeEnd('documentation-generation');
      console.log('Documentation returned from cache');
      return new NextResponse(JSON.stringify(cache.get(cacheKey).data), { status: 200 });
    }

    // Enhanced URL matching to handle various formats
    let owner, repoName;
    
    // Format 1: Full GitHub URL https://github.com/owner/repo
    const githubUrlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/\s#?]+)/i;
    const githubMatch = repoUrl.match(githubUrlPattern);
    
    // Format 2: Simple owner/repo format
    const simpleRepoPattern = /^([^\/\s]+)\/([^\/\s#?]+)$/;
    const simpleMatch = repoUrl.match(simpleRepoPattern);
    
    if (githubMatch && githubMatch[1] && githubMatch[2]) {
      owner = githubMatch[1];
      repoName = githubMatch[2].replace(/\/$/, '').trim();
    } else if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
      owner = simpleMatch[1];
      repoName = simpleMatch[2];
    } else {
      return new NextResponse(JSON.stringify({ error: "Invalid GitHub repository URL format. Please use 'username/repository' or a complete GitHub URL." }), { status: 400 });
    }

    console.log(`Processing repository: ${owner}/${repoName}`);
    const filePaths = await getRepoFiles(owner, repoName, octokit);
    
    if (!filePaths.length) {
      return new NextResponse(JSON.stringify({ error: "No files found in the repository." }), { status: 404 });
    }
    
    console.log(`Found ${filePaths.length} files, applying filters`);
    
    // Set a reasonable file limit to prevent overloading
    const FILE_LIMIT = 25;
    let relevantFiles = filePaths;

    // Apply filters based on contextOptions if available
    if (contextOptions) {
      // Filter files based on user's preferences
      relevantFiles = filePaths.filter(path => {
        // Always include README if requested
        if (contextOptions.includeReadme && /readme\.md$/i.test(path)) {
          return true;
        }
        
        // Skip source code if not requested
        if (!contextOptions.includeSourceCode && /\.(js|jsx|ts|tsx|py|java|go|c|cpp|h|hpp)$/i.test(path)) {
          return false;
        }
        
        // Skip common directories that add noise
        if (/node_modules\/|\.git\/|\.next\/|dist\/|build\/|vendor\/|\.cache\//.test(path)) {
          return false;
        }
        
        // Skip large binary files
        if (/\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|ogg|mp3|wav|pdf|zip|tar|gz)$/i.test(path)) {
          return false;
        }
        
        return true;
      });
    } else {
      // Default filter for common code and text files if no context options
      relevantFiles = filePaths.filter(path => 
        /\.(js|jsx|ts|tsx|py|md|txt|java|go|c|cpp|h|hpp|css|scss|html)$/i.test(path) &&
        !/node_modules\/|\.git\/|\.next\/|dist\/|build\//.test(path)
      );
    }

    // Limit number of files to process for faster generation
    relevantFiles = relevantFiles.slice(0, FILE_LIMIT);
    console.log(`Processing ${relevantFiles.length} relevant files (limited to ${FILE_LIMIT})`);

    // Get README first if it exists for better context
    const readmeFile = relevantFiles.find(path => /readme\.md$/i.test(path));
    let allFileContents = "";
    
    if (readmeFile && contextOptions?.includeReadme) {
      const readmeContent = await getFileContent(owner, repoName, readmeFile, octokit);
      if (readmeContent) {
        allFileContents += `\n\n--- File: ${readmeFile} (README) ---\n${readmeContent}`;
      }
      
      // Remove README from list as it's already processed
      relevantFiles = relevantFiles.filter(path => path !== readmeFile);
    }

    // Process other files with size limits
    let processedFiles = 0;
    for (const filePath of relevantFiles) {
      const content = await getFileContent(owner, repoName, filePath, octokit);
      if (content) {
        allFileContents += `\n\n--- File: ${filePath} ---\n${trimFileContent(content)}`;
        processedFiles++;
        
        // Add early break if content becomes too large
        if (allFileContents.length > 100000) { // ~100KB limit
          allFileContents += "\n\n[Additional files omitted due to size constraints]";
          break;
        }
      }
    }

    console.log(`Successfully processed ${processedFiles} files`);
    
    if (!allFileContents.trim()) {
      return new NextResponse(JSON.stringify({ error: "Could not retrieve content from the repository." }), { status: 500 });
    }

    // Build prompt based on context options
    let prompt;
    
    if (contextOptions?.customPrompt) {
      // Use the custom prompt if provided
      prompt = `Generate documentation for the following GitHub repository content based on these instructions:
      
${contextOptions.customPrompt}

Repository files:
${allFileContents}\n\n`;
    } else {
      // Otherwise use the default prompt based on context options
      const documentationType = contextOptions ? 
        `brief but comprehensive documentation with ${contextOptions.includeReadme ? 'README content, ' : ''}${contextOptions.includeSourceCode ? 'key code explanations, ' : ''}${contextOptions.includeIssues ? 'issue summaries, ' : ''}${contextOptions.includePullRequests ? 'pull request details, ' : ''}` : 
        'brief but comprehensive documentation';

      prompt = `Generate ${documentationType} for the following GitHub repository content. 
Focus on the most important details and make the documentation concise but informative.
Structure the documentation with clear headings and organize the information for easy reading.
Include a directory structure overview to help understand the project organization.
\n\n${allFileContents}\n\n`;
    }

    console.log('Sending request to AI model');
    
    // Set timeout for AI generation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), 45000); // 45 seconds timeout
    });
    
    // Generate content with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as any;

    const generatedDocumentation = result.response?.text();

    if (generatedDocumentation) {
      console.log('Documentation successfully generated');
      console.timeEnd('documentation-generation');
      
      // Cache the result
      const responseData = { documentation: generatedDocumentation };
      cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
      
      return new NextResponse(JSON.stringify(responseData), { status: 200 });
    } else {
      return new NextResponse(JSON.stringify({ error: "Failed to generate documentation." }), { status: 500 });
    }

  } catch (error: any) {
    console.error("Error processing GitHub repository:", error);
    console.timeEnd('documentation-generation');
    return new NextResponse(JSON.stringify({ error: error.message || "An unknown error occurred" }), { status: 500 });
  }
}