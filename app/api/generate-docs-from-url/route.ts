// app/api/generate-docs-from-url/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Octokit } from "octokit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
const githubPat = process.env.YOUR_GITHUB_PAT; // Set your PAT in environment variables

async function getRepoFiles(owner: string, repo: string, octokit: Octokit, path: string = ""): Promise<string[]> {
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: "HEAD",
    recursive: "true",
  });

  if (!data?.tree) {
    return [];
  }

  return data.tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path);
}

async function getFileContent(owner: string, repo: string, path: string, octokit: Octokit): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      mediaType: {
        format: "raw",
      },
    });
    if (typeof data === 'string') {
      return data;
    }
    return null;
  } catch (error: any) {
    console.error(`Error fetching content for ${path}:`, error.message);
    return null;
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!githubPat) {
    console.error("GitHub Personal Access Token not found in environment variables (YOUR_GITHUB_PAT).");
    return new NextResponse(JSON.stringify({ error: "GitHub Personal Access Token not configured on the server." }), { status: 500 });
  }

  const octokit = new Octokit({ auth: githubPat });

  try {
    const { repoUrl, documentationType } = await req.json();

    if (!repoUrl || !documentationType) {
      return new NextResponse(JSON.stringify({ error: "Missing repository URL or documentation type." }), { status: 400 });
    }

    const urlParts = repoUrl.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
    if (!urlParts) {
      return new NextResponse(JSON.stringify({ error: "Invalid GitHub repository URL format." }), { status: 400 });
    }

    const owner = urlParts[1];
    const repoName = urlParts[2];

    const filePaths = await getRepoFiles(owner, repoName, octokit);
    const relevantFiles = filePaths.filter(path =>
      /\.(js|jsx|ts|tsx|py|md|txt|java|go|c|cpp|h|hpp)$/i.test(path) // Filter for common code and text files
    );

    let allFileContents = "";
    for (const filePath of relevantFiles) {
      const content = await getFileContent(owner, repoName, filePath, octokit);
      if (content) {
        allFileContents += `\n\n--- File: ${filePath} ---\n${content}`;
      }
    }

    if (!allFileContents) {
      return new NextResponse(JSON.stringify({ error: "Could not retrieve content from the repository." }), { status: 500 });
    }

    const prompt = `Generate ${documentationType} for the following GitHub repository content: and give readme.md file content\n\n${allFileContents}\n\n`;

    const result = await model.generateContent(prompt);
    const generatedDocumentation = result.response?.text();

    if (generatedDocumentation) {
      return new NextResponse(JSON.stringify({ documentation: generatedDocumentation }), { status: 200 });
    } else {
      return new NextResponse(JSON.stringify({ error: "Failed to generate documentation." }), { status: 500 });
    }

  } catch (error: any) {
    console.error("Error processing GitHub repository:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}