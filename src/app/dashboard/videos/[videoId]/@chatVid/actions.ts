"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateVideoBulletPointSummary } from "@/lib/gemini";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convexClient = getConvexClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askQuestion(
  question: string,
  videoId: string,
  userId: string
) {
  const stream = createStreamableValue();
  // Get the video
  const video = await convexClient.query(api.video.getVideoById, {
    videoRecordId: videoId as Id<"video">,
  });

  //  Prepare context string
  const context = video
    ?.transcript!.map((chunk, i) => `${chunk.timestamp} : ${chunk.text}`)
    .join("\n\n");

  // Stream response from Gemini
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are an AI assistant helping a user understand an educational youtube video. Be clear, friendly, and detailed in your responses. Use markdown formatting and emojis to improve readability.
        
        Use only the information provided in the CONTEXT BLOCK to answer the question.

        START CONTEXT BLOCK
        \nVideo Metadata:\nTitle:\n${video?.title}\nDescription:\n${video?.description}\nSummary:\n${video?.summary ?? "No summary available"}\n
        \nContext:\n${context}
        END CONTEXT BLOCK

        START QUESTION
        ${question}
        END QUESTION

        If the context doesn't contain relevant information, politely say: "Sorry, I couldn't find anything relevant in the video."`,
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

export async function generateSummary(videoId: string, userId: string) {
  try {
    const video = await convexClient.query(api.video.getVideobyUserAndVideoId, {
      userId,
      videoId,
    });
    if (!video) {
      return {
        output: "Sorry, this video doesn't exist!",
      };
    }

    const videoTranscript = video.transcript
      ?.map((t) => {
        return `${t.timestamp} : ${t.text}`;
      })
      .join("\n");

    if (
      !videoTranscript ||
      videoTranscript === undefined ||
      videoTranscript === null
    ) {
      return {
        output: "Sorry, transcript doesn't exist for this video!",
      };
    }

    const summary = await generateVideoBulletPointSummary(videoTranscript);
    if (summary.trim().length < 0) {
      throw new Error("Can't generate summary! Try again later!");
    }

    await convexClient.mutation(api.video.updateVideoById, {
      userId,
      videoId,
      summary,
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
