"use server";

import { VideoDetails } from "@/lib/types/types";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function getVideoDetails(
  videoId: string
): Promise<VideoDetails | null> {
  // console.log("Fetching video details for ",videoId);

  try {
    //get video details
    const videoResponse = await youtube.videos.list({
      part: ["statistics", "snippet"],
      id: [videoId],
    });
    // console.log(videoResponse);
    const videoDetails = videoResponse.data.items?.[0];
    if (!videoDetails) throw new Error("Video not found!");

    console.log("video details fetched successfully!");

    const video: VideoDetails = {
      // Video Info
      title: videoDetails.snippet?.title || "Unknown Title",
      description: videoDetails.snippet?.description || "Unknown Description",
      thumbnail:
        videoDetails.snippet?.thumbnails?.maxres?.url ||
        videoDetails.snippet?.thumbnails?.high?.url ||
        videoDetails.snippet?.thumbnails?.default?.url ||
        "",
    };
    // console.log("The video", video);
    return video;
  } catch (error) {
    console.error("Error fetching details", error);
    return null;
  }
}


