"use server";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function embedCodeFile(doc: Document) {
  const summary = await summarizeCode(doc);
  if (summary.trim().length === 0) {
    return {
      error: "No summary generated!",
    };
  }
  const embedding = await generateEmbedding(summary);
  if (embedding === null || embedding === undefined) {
    return {
      error: "Couldn't generate embedding",
    };
  }

  if (embedding.length === 0) {
    return {
      error: "Couldn't generate embedding",
    };
  }

  return {
    summary,
    embedding,
  };
}

export async function loadGithubRepo(
  githubUrl: string,
  branch: string,
  githubToken?: string
) {
  try {
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken || process.env.GITHUB_TOKEN!,
      branch,
      ignoreFiles: [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "bun.lockb",
        "README.md",
      ],
      ignorePaths: [".gitignore", ".env", "favicon.ico"],
      recursive: true,
      unknown: "warn",
      maxConcurrency: 5,
    });

    const docs = await loader.load();
    return {docs,success:"Docs loaded successfully!"};
  } catch (error) {
    console.error("Error loading GitHub repo:", error);
    return {docs:[],error:"Something went Wrong!"}
  }
}

export async function githubRepoLoader(
  githubUrl: string,
  githubToken?: string
) {
  const [owner, repo] = githubUrl.split("/").slice(3, 5);
  const response = await octokit.request(
    `GET /repos/${owner}/${repo}/contents/`,
    {
      owner,
      repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  const files = response.data;
  console.log("files : ", files);
  for (const file of files) {
    console.log(file._links);
  }
}

