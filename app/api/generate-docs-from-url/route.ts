// app/api/generate-docs-from-url/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import clientPromise from "@/lib/mongodb-edge";
import {
  IContextOptions,
  IDocCache,
  areContextOptionsEqual,
} from "@/models/DocCache";

// Configure model with faster response options
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  // Add generation config for faster responses
  generationConfig: {
    temperature: 0.2, // Lower temperature for more focused responses
    maxOutputTokens: 2048, // Limit response size
  },
});

const githubPat = process.env.YOUR_GITHUB_PAT;

// Simple in-memory cache to avoid redundant API calls
const cache = new Map();
// Cache expiration time (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Adjust timeout for fetching files - shorter to prevent server timeout
const TIMEOUT_MS = 10000; // 10 seconds timeout

// Add request timeout handling
export const runtime = "nodejs"; // Use Node.js runtime to resolve 'dns' module issue
export const maxDuration = 59; // Set maximum duration to 59 seconds (just under the 60s Vercel limit)

// Maximum number of retries for API calls
const MAX_RETRIES = 2;

// More aggressive file limit to prevent timeouts
const FILE_LIMIT = 15; // Reduced from 25

// Decrease content size limit to process faster
const MAX_CONTENT_SIZE = 80000; // ~80KB limit (down from 100KB)

// Helper function to retry API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Retrying operation, ${retries} attempts left`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
    return withRetry(fn, retries - 1);
  }
}

async function getRepoFiles(
  owner: string,
  repo: string,
  octokit: Octokit
): Promise<string[]> {
  const cacheKey = `files-${owner}-${repo}`;

  // Check cache first
  if (
    cache.has(cacheKey) &&
    Date.now() - cache.get(cacheKey).timestamp < CACHE_TTL
  ) {
    return cache.get(cacheKey).data;
  }

  try {
    return await withRetry(async () => {
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
    });
  } catch (error: any) {
    console.error(`Error fetching repo files: ${error.message}`);
    return [];
  }
}

async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  octokit: Octokit
): Promise<string | null> {
  const cacheKey = `content-${owner}-${repo}-${path}`;

  // Check cache first
  if (
    cache.has(cacheKey) &&
    Date.now() - cache.get(cacheKey).timestamp < CACHE_TTL
  ) {
    return cache.get(cacheKey).data;
  }

  try {
    return await withRetry(async () => {
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

      if (typeof data === "string") {
        // Store in cache
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
      return null;
    });
  } catch (error: any) {
    console.error(`Error fetching content for ${path}: ${error.message}`);
    return null;
  }
}

// Helper to limit file size and content processed - use more aggressive trimming
function trimFileContent(content: string, maxChars = 3000): string {
  if (content.length <= maxChars) return content;
  return content.substring(0, maxChars) + "... [truncated for size]";
}

// Prioritize important files for documentation
function prioritizeFiles(files: string[]): string[] {
  // Sort files to prioritize important documentation files and main source code
  return files.sort((a, b) => {
    // Prioritize readme files
    if (/readme\.md$/i.test(a)) return -1;
    if (/readme\.md$/i.test(b)) return 1;

    // Then prioritize package.json and similar config files
    if (/package\.json|tsconfig\.json|composer\.json$/i.test(a)) return -1;
    if (/package\.json|tsconfig\.json|composer\.json$/i.test(b)) return 1;

    // Then prioritize main source files
    if (/^(src|app|lib)\/.*\.(js|ts|py|java)$/i.test(a)) return -1;
    if (/^(src|app|lib)\/.*\.(js|ts|py|java)$/i.test(b)) return 1;

    return 0;
  });
}

export async function POST(req: Request): Promise<Response> {
  if (!githubPat) {
    console.error(
      "GitHub Personal Access Token not found in environment variables (YOUR_GITHUB_PAT)."
    );
    return new NextResponse(
      JSON.stringify({
        error: "GitHub Personal Access Token not configured on the server.",
      }),
      { status: 500 }
    );
  }

  const octokit = new Octokit({ auth: githubPat });
  console.time("documentation-generation");

  try {
    const { repoUrl, contextOptions, forceRefresh = false } = await req.json();

    if (!repoUrl) {
      return new NextResponse(
        JSON.stringify({ error: "Missing repository URL." }),
        { status: 400 }
      );
    }

    // Enhanced URL matching to handle various formats
    let owner: string, repoName: string;

    // Format 1: Full GitHub URL https://github.com/owner/repo
    const githubUrlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/\s#?]+)/i;
    const githubMatch = repoUrl.match(githubUrlPattern);

    // Format 2: Simple owner/repo format
    const simpleRepoPattern = /^([^\/\s]+)\/([^\/\s#?]+)$/;
    const simpleMatch = repoUrl.match(simpleRepoPattern);

    if (githubMatch && githubMatch[1] && githubMatch[2]) {
      owner = githubMatch[1];
      repoName = githubMatch[2].replace(/\/$/, "").trim();
    } else if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
      owner = simpleMatch[1];
      repoName = simpleMatch[2];
    } else {
      return new NextResponse(
        JSON.stringify({
          error:
            "Invalid GitHub repository URL format. Please use 'username/repository' or a complete GitHub URL.",
        }),
        { status: 400 }
      );
    }

    console.log(`Processing repository: ${owner}/${repoName}`);

    // Check MongoDB cache first before proceeding (if not forced refresh)
    if (!forceRefresh) {
      try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("doccaches");

        // Try to find an existing cache entry
        const cachedDocs = await collection
          .find({
            repoOwner: owner,
            repoName: repoName,
          })
          .toArray();

        // Find the best match by comparing context options
        const currentOptions: IContextOptions = {
          includeReadme: contextOptions?.includeReadme ?? true,
          includeSourceCode: contextOptions?.includeSourceCode ?? true,
          includeIssues: contextOptions?.includeIssues ?? false,
          includePullRequests: contextOptions?.includePullRequests ?? false,
          quickMode: contextOptions?.quickMode ?? true,
          customPrompt: contextOptions?.customPrompt ?? "",
        };

        const matchingDoc = cachedDocs.find((doc) =>
          areContextOptionsEqual(doc.contextOptions, currentOptions)
        );

        if (matchingDoc) {
          console.log("Documentation returned from MongoDB cache");
          console.timeEnd("documentation-generation");
          return new NextResponse(
            JSON.stringify({
              documentation: matchingDoc.documentation,
              fromCache: true,
              cachedAt: matchingDoc.updatedAt,
            }),
            { status: 200 }
          );
        }

        console.log("No cached version found, generating new documentation");
      } catch (dbError) {
        // If there's an error with MongoDB, log it but continue with generation
        console.error("MongoDB connection error:", dbError);
        // Continue with generation and in-memory cache
      }
    } else {
      console.log("Forced refresh requested, skipping cache");
    }

    // Create a promise that rejects after a specific time to handle overall timeout
    const overallTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Overall request timeout")), 55000); // 55 seconds timeout
    });

    // Wrap the whole processing in a race with the timeout
    const processingPromise = async () => {
      const filePaths = await getRepoFiles(owner, repoName, octokit);

      if (!filePaths.length) {
        throw new Error("No files found in the repository.");
      }

      console.log(`Found ${filePaths.length} files, applying filters`);

      let relevantFiles = filePaths;

      // Apply filters based on contextOptions if available
      if (contextOptions) {
        // Filter files based on user's preferences
        relevantFiles = filePaths.filter((path) => {
          // Always include README if requested
          if (contextOptions.includeReadme && /readme\.md$/i.test(path)) {
            return true;
          }

          // Skip source code if not requested
          if (
            !contextOptions.includeSourceCode &&
            /\.(js|jsx|ts|tsx|py|java|go|c|cpp|h|hpp)$/i.test(path)
          ) {
            return false;
          }

          // Skip common directories that add noise
          if (
            /node_modules\/|\.git\/|\.next\/|dist\/|build\/|vendor\/|\.cache\//.test(
              path
            )
          ) {
            return false;
          }

          // Skip large binary files
          if (
            /\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|ogg|mp3|wav|pdf|zip|tar|gz)$/i.test(
              path
            )
          ) {
            return false;
          }

          return true;
        });
      } else {
        // Default filter for common code and text files if no context options
        relevantFiles = filePaths.filter(
          (path) =>
            /\.(js|jsx|ts|tsx|py|md|txt|java|go|c|cpp|h|hpp|css|scss|html)$/i.test(
              path
            ) && !/node_modules\/|\.git\/|\.next\/|dist\/|build\//.test(path)
        );
      }

      // Prioritize files that are most important for documentation
      relevantFiles = prioritizeFiles(relevantFiles);

      // Limit number of files to process for faster generation
      relevantFiles = relevantFiles.slice(0, FILE_LIMIT);
      console.log(
        `Processing ${relevantFiles.length} relevant files (limited to ${FILE_LIMIT})`
      );

      // Get README first if it exists for better context
      const readmeFile = relevantFiles.find((path) =>
        /readme\.md$/i.test(path)
      );
      let allFileContents = "";

      if (readmeFile && contextOptions?.includeReadme) {
        const readmeContent = await getFileContent(
          owner,
          repoName,
          readmeFile,
          octokit
        );
        if (readmeContent) {
          allFileContents += `\n\n--- File: ${readmeFile} (README) ---\n${readmeContent}`;
        }

        // Remove README from list as it's already processed
        relevantFiles = relevantFiles.filter((path) => path !== readmeFile);
      }

      // Process other files with size limits
      let processedFiles = 0;

      // Process files in parallel to speed up (with a limit of 5 concurrent requests)
      const promises = [];
      const concurrentLimit = 5;

      for (
        let i = 0;
        i < Math.min(concurrentLimit, relevantFiles.length);
        i++
      ) {
        const startIndex = i;
        promises.push(
          processFileBatch(relevantFiles, startIndex, concurrentLimit)
        );
      }

      async function processFileBatch(
        files: string[],
        startIndex: number,
        step: number
      ): Promise<string> {
        let fileContent = "";
        for (let i = startIndex; i < files.length; i += step) {
          const filePath = files[i];
          const content = await getFileContent(
            owner,
            repoName,
            filePath,
            octokit
          );
          if (content) {
            fileContent += `\n\n--- File: ${filePath} ---\n${trimFileContent(
              content
            )}`;
            processedFiles++;
          }

          // Check if we've reached our size limit
          if (fileContent.length + allFileContents.length > MAX_CONTENT_SIZE) {
            break;
          }
        }
        return fileContent;
      }

      // Gather all file contents from parallel processing
      const results = await Promise.all(promises);
      for (const result of results) {
        allFileContents += result;

        // Check if we've hit our content size limit
        if (allFileContents.length > MAX_CONTENT_SIZE) {
          allFileContents +=
            "\n\n[Additional files omitted due to size constraints]";
          break;
        }
      }

      console.log(`Successfully processed ${processedFiles} files`);

      if (!allFileContents.trim()) {
        throw new Error("Could not retrieve content from the repository.");
      }

      // Build prompt based on context options
      let prompt;

      if (contextOptions?.customPrompt) {
        // Use the custom prompt if provided, with enhanced structure for better AI responses
        prompt = `Generate comprehensive documentation for the GitHub repository based on the following custom instructions:

CUSTOM INSTRUCTIONS:
${contextOptions.customPrompt}

DOCUMENTATION GUIDELINES:
- Structure the documentation with clear headings and subheadings
- Prioritize clarity and readability for the target audience
- Include code examples where appropriate with proper markdown formatting
- Highlight important methods, classes, and functions
- Explain the architectural patterns and design decisions where evident
- Summarize the overall purpose and functionality of the repository

REPOSITORY CONTENT:
${allFileContents}\n\n`;
      } else {
        // Otherwise use the default prompt based on context options with improved guidance
        const documentationType = contextOptions
          ? `comprehensive documentation with ${
              contextOptions.includeReadme ? "README analysis, " : ""
            }${
              contextOptions.includeSourceCode ? "key code explanations, " : ""
            }${contextOptions.includeIssues ? "issue summaries, " : ""}${
              contextOptions.includePullRequests
                ? "pull request insights, "
                : ""
            }`
          : "comprehensive documentation";

        prompt = `Generate ${documentationType} for the following GitHub repository content.

DOCUMENTATION GUIDELINES:
- Begin with a clear introduction explaining the repository's purpose and main functionality
- Structure the documentation with logical headings and subheadings
- Include a directory structure overview to help understand the project organization
- Focus on the most important components and functionality
- Explain core concepts and design patterns used in the code
- Use markdown formatting consistently throughout the documentation
- Include code examples for important functions/methods where relevant
- Make the documentation approachable for developers new to the codebase

REPOSITORY CONTENT:
${allFileContents}\n\n`;
      }

      console.log("Sending request to AI model");

      // Set timeout for AI generation (shorter than the overall timeout)
      const aiTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI generation timeout")), 40000); // 40 seconds timeout
      });

      // Generate content with timeout
      const result = (await Promise.race([
        model.generateContent(prompt),
        aiTimeoutPromise,
      ])) as any;

      const generatedDocumentation = result.response?.text();

      if (!generatedDocumentation) {
        throw new Error("Failed to generate documentation.");
      }

      console.log("Documentation successfully generated");
      const responseData = { documentation: generatedDocumentation };

      // Define cache key for memory cache
      const cacheKey = `docs-${owner}-${repoName}-${JSON.stringify(
        contextOptions
      )}`;
      cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

      // Store in MongoDB for persistence
      try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("doccaches");

        const now = new Date();

        // Save to MongoDB
        await collection.updateOne(
          {
            repoOwner: owner,
            repoName: repoName,
            "contextOptions.includeReadme":
              contextOptions?.includeReadme ?? true,
            "contextOptions.includeSourceCode":
              contextOptions?.includeSourceCode ?? true,
            "contextOptions.includeIssues":
              contextOptions?.includeIssues ?? false,
            "contextOptions.includePullRequests":
              contextOptions?.includePullRequests ?? false,
          },
          {
            $set: {
              repoOwner: owner,
              repoName: repoName,
              contextOptions: {
                includeReadme: contextOptions?.includeReadme ?? true,
                includeSourceCode: contextOptions?.includeSourceCode ?? true,
                includeIssues: contextOptions?.includeIssues ?? false,
                includePullRequests:
                  contextOptions?.includePullRequests ?? false,
                quickMode: contextOptions?.quickMode ?? true,
                customPrompt: contextOptions?.customPrompt ?? "",
              },
              documentation: generatedDocumentation,
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          { upsert: true }
        );
        console.log("Documentation saved to MongoDB");
      } catch (dbError) {
        console.error("Error saving to MongoDB:", dbError);
        // Continue even if MongoDB save fails
      }

      return responseData;
    };

    // Race between processing and overall timeout
    const responseData = (await Promise.race([
      processingPromise(),
      overallTimeoutPromise,
    ])) as any;

    console.timeEnd("documentation-generation");
    return new NextResponse(JSON.stringify(responseData), { status: 200 });
  } catch (error: any) {
    console.error("Error processing GitHub repository:", error);
    console.timeEnd("documentation-generation");

    // Provide helpful timeout-specific error messages
    const errorMessage = error.message || "An unknown error occurred";

    if (errorMessage.includes("timeout")) {
      return new NextResponse(
        JSON.stringify({
          error:
            "The request timed out. Please try a smaller repository or more specific filtering options.",
          isTimeout: true,
        }),
        { status: 504 }
      );
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
