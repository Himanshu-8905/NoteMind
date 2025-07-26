"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding, summarizeCodeInBulletPoints } from "@/lib/gemini";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

const convexClient = getConvexClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askProjQuestion(
  question: string,
  projectId: string,
  userId: string,
  selectedFiles?: Doc<"sourceCodeEmbedding">[]
) {
  const stream = createStreamableValue();
  let results;
  if (selectedFiles !== undefined && selectedFiles.length > 0) {
    results = selectedFiles.map((file, index) => {
      return {
        type: "sourceCodeEmbedding",
        score: index,
        record: file,
      };
    });
  } else {
    const queryVector = await generateEmbedding(question);

    results = await convexClient.action(
      api.sourceCodeEmbedding.getSimilarResults,
      {
        userId,
        projectId: projectId as Id<"project">,
        searchQuery: queryVector,
      }
    );
  }

  let context = ``;

  for (const doc of results) {
    context += `source : ${doc.record.fileName}\n code: ${doc.record.sourceCode}\n summary of file : ${doc.record.bulletPointSummary}`;
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are an ai code assistant who answers questions about the codebase. Your target audience is a technical student who has no idea about the codebase.
      Answer to questions in a well-behaved, kind, inspiring and friendly manner and provide vivid and thoughtful responses to the user.
      Use emojis to make the conversation more interactive.
      If the question is about code or a specific file, give detailed, step-by-step response.
      SOME INFOs : 
      .gitignore file contains all the filenames or extensions that won't be pushed into github
      .env or .env.example or .env.local files are used to store environment variables needed for the application.

      START CONTEXT BLOCK
      ${context}
      END CONTEXT BLOCK
      \n\n
      START QUESTION
      ${question}
      END QUESTION

      Take into account the context block provided in the conversation for answering questions about this codebase and any code files in this codebase.
      Don't try to invent anything that's not in the context block. If the context doesn't provide the answer to the question say : "I'm sorry, but I didn't find anything related in the repo."
      Answer in markdown syntax with code snippets if needed. Be as detailed as possible when answering.`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    fileRefferences: results,
  };
}

export async function generateCodeFileSummary(id: string, userId: string) {
  try {
    const codeFile = await convexClient.query(
      api.sourceCodeEmbedding.getCodeEmbeddingById,
      {
        id: id as Id<"sourceCodeEmbedding">,
      }
    );
    if (!codeFile || codeFile === undefined || codeFile === null) {
      return {
        error: "Sorry, this code file doesn't exist!",
      };
    }
    const existingSummary = codeFile.bulletPointSummary;
    if (existingSummary) {
      return {
        summary: existingSummary,
      };
    }
    const bulletPointSummary = await summarizeCodeInBulletPoints(
      codeFile.sourceCode,
      codeFile.fileName
    );
    if (bulletPointSummary.trim().length < 0) {
      throw new Error("Can't generate summary! Try again later!");
    }
    const embedding = await generateEmbedding(bulletPointSummary);
    if (!embedding) {
      console.error("Can't generate embedding! Try again later!");
      return {
        summary: bulletPointSummary,
      };
    }

    await convexClient.mutation(api.sourceCodeEmbedding.addEmbedding, {
      id: id as Id<"sourceCodeEmbedding">,
      userId,
      bulletPointSummary,
      summaryEmbedding: embedding,
    });

    return {
      summary: bulletPointSummary,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong!",
    };
  }
}
