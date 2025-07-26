"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateBulletPointSummary, generateEmbedding } from "@/lib/gemini";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convexClient = getConvexClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askDocQuestion(
  question: string,
  docId: string,
  userId: string
) {
  const stream = createStreamableValue();

  // Generate embedding for the user question
  const queryVector = await generateEmbedding(question);

  // Get the document
  const document = await convexClient.query(api.documents.getDocument, {
    docId: docId as Id<"documents">,
  });

  // Perform vector search for relevant chunks
  const chunks = await convexClient.action(api.documentsChunks.searchChunks, {
    searchQuery: queryVector,
    userId,
    docId: docId as Id<"documents">,
    limit: 5, // adjust as needed
  });

  // Prepare context string
  const context = chunks
    .map((chunk, i) => `Chunk ${i + 1}:\n${chunk.record.text}`)
    .join("\n\n");

  //Stream response from Gemini
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are an AI assistant helping a user understand a document. Be clear, friendly, and detailed in your responses. Use markdown formatting and emojis to improve readability.
        
        Use only the information provided in the CONTEXT BLOCK to answer the question.

        START CONTEXT BLOCK
        \nDocument Metadata:\nName:\n${document?.title}\nDescription:\n${document?.description}\nSummary:\n${document?.summary}\n
        \nContext:\n${context}
        END CONTEXT BLOCK

        START QUESTION
        ${question}
        END QUESTION

        If the context doesn't contain relevant information, politely say: "Sorry, I couldn't find anything relevant in the document."`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
  };
}

export async function generateSummary(docId: string, userId: string) {
  try {
    const document = await convexClient.query(api.documents.getDocument, {
      docId: docId as Id<"documents">,
    });
    if (!document || document === undefined || document === null) {
      return {
        output: "Sorry, this document doesn't exist!",
      };
    }
    const chunks = await convexClient.query(api.documentsChunks.getAllChunks, {
      docId: docId as Id<"documents">,
      userId,
    });

    const context = chunks.map((chunk) => chunk.text.trim()).join("\n");

    const summary = await generateBulletPointSummary(context);
    if (summary.trim().length < 0) {
      throw new Error("Can't generate summary! Try again later!");
    }

    await convexClient.mutation(api.documents.addSummaryToDoc, {
      bulletPointSummary: summary,
      docId: docId as Id<"documents">,
      userId,
    });

    return {
      output: summary,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong!",
    };
  }
}
