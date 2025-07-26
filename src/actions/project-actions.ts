"use server";
import { githubRepoLoader, loadGithubRepo } from "@/lib/github-loader";
import { getConvexClient } from "@/lib/convex";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

const convexClient = getConvexClient();

export const indexGithubRepo = async (
  userId: string,
  projectId: string,
  githubUrl: string,
  branch: string,
  githubToken?: string
) => {
  try {
    console.log("Loading github repo");
    //const data = await githubRepoLoader(githubUrl,githubToken);
    const { docs, success, error } = await loadGithubRepo(
      githubUrl,
      branch,
      githubToken
    );
    if (!docs || docs.length === 0 || error) {
      console.error("Repo loading failed:", error);
      return {
        error:"Repository could not be loaded or is empty.",
      };
    }

    console.log("Loading files...");
    await Promise.all(
      docs.map(async (doc, index) => {
        console.log(
          `${index} . saving the file : ${doc.metadata.source.toLowerCase()}`
        );
        return await convexClient.mutation(
          api.sourceCodeEmbedding.saveCodeEmbedding,
          {
            fileName: doc.metadata.source.toLowerCase(),
            projectId: projectId as Id<"project">,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            userId,
          }
        );
      })
    );
    return {
      success: "Repository files loaded and saved successfully!",
    };
  } catch (err) {
    console.error("Unexpected error in indexGithubRepo:", err);
    return {
      error:"An unexpected error occurred.",
    };
  }
};
