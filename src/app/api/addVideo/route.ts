"use server";
import { getConvexClient } from "@/lib/convex";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import { getVideoDetails } from "@/actions/video-actions/getVideoDetails";
import { getVideoIdFromUrl } from "@/lib/getVideoIdFromUrl";
import { getVideoTranscript } from "@/actions/video-actions/getVideoTranscript";
import { ConvexHttpClient } from "convex/browser";

//for uploading to convex cloud
const convexClient: ConvexHttpClient = getConvexClient();

export async function POST(req: Request): Promise<Response> {
  const user = await currentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      throw new Error("Can't extract video id!");
    }
    const videoDetails = await getVideoDetails(videoId);
    if (!videoDetails) {
      throw new Error("Can't add video!");
    }

    const { transcript, cache } = await getVideoTranscript(videoId);
    console.log(transcript);
    if (
      transcript === undefined ||
      transcript === null ||
      transcript.length === 0
    ) {
      throw new Error("Can't extract video transcript!");
    }

    const videoRecord = await convexClient.mutation(api.video.addVideo, {
      userId: user.id,
      url,
      title: videoDetails.title,
      description: videoDetails.description,
      thumbnail: videoDetails.thumbnail,
      videoId,
      transcript: transcript,
    });

    if (!videoRecord) {
      throw new Error("Can't add video record!");
    }

    // Return a successful response
    return NextResponse.json(
      {
        message: `Video : ${videoDetails.title} Added!`,
        videoId:videoRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while video adding : ", error);
    return new Response(JSON.stringify({ error: "Something went wrong!" }), {
      status: 400,
    });
  }
}
