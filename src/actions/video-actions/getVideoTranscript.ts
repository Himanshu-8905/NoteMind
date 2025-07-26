"use server";
import { currentUser } from "@clerk/nextjs/server";
import { Innertube } from "youtubei.js";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { TranscriptEntry } from "@/lib/types/types";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const youtube = await Innertube.create({
  lang: "en",
  location: "IN",
  retrieve_player: false,
});

function formatTimestamp(start_ms: number): string {
  const minutes = Math.floor(start_ms / 60000);
  const seconds = Math.floor((start_ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const fetchTranscript = async (videoId: string): Promise<TranscriptEntry[]> => {
  try {
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();
    const transcript: TranscriptEntry[] =
      transcriptData.transcript.content?.body?.initial_segments.map(
        (segment) => ({
          text: segment.snippet.text ?? "N/A",
          timestamp: formatTimestamp(Number(segment.start_ms)),
        })
      ) ?? [];
    //    console.log("transcript from fetchTranscript(main) : ", transcript);
    return transcript;
  } catch (error) {
    console.error("Error fetching transcript :", error);
    throw error;
  }
};

export async function getVideoTranscript(videoId: string) {
  const user = await currentUser();

  // If not fetch from youtube
  try {
    // Check if transcript already exists in db [iF IT'S cached]
    const existingVideo = await convex.query(
      api.video.getVideobyUserAndVideoId,
      {
        videoId,
        userId: user?.id ?? "",
      }
    );

    if(existingVideo){
      const existingTranscript = existingVideo?.transcript;

      if (existingTranscript) {
        console.log("Transcript found in db");
        return {
          transcript: existingTranscript,
          cache:
            "This video has already been transcribed - Accessing cached transcript instead of using a token",
        };
      }else{
        throw new Error("Transcript not found!");
      }
    }else{
      const transcript = await fetchTranscript(videoId);
      //  console.log("transcript from getYtTranscript : ",transcript)

      //Return transcript
      return {
        transcript,
        cache:
          "This video was transcribed using a token, the transcript is now saved in database",
      };
    }
  } catch (error) {
    console.error("Error fetching transcript : ", error);
    return {
      transcript: [],
      cache: "Error fetching transcript. Please try again later",
    };
  }
}
