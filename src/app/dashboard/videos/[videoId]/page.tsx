"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";

const Video = () => {
  const params = useParams<{ videoId: string }>();
  const { videoId } = params;
  const { user } = useUser();

  const currentVideo = useQuery(api.video.getVideoById, {
    videoRecordId: videoId as Id<"video">,
  });

  const [collapsed,setCollapsed] = useState(true);

  if (
    !videoId ||
    currentVideo === null ||
    currentVideo === undefined ||
    !user
  ) {
    return (
      <div className="text-red-400 text-xl w-full py-4 px-5 border border-dashed border-red-400 text-center rounded-md">
        You have no access to view this Video details
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Thumbnail */}
      <div className="w-full aspect-video overflow-hidden rounded-xl shadow-md">
        <Image
          src={currentVideo.thumbnail}
          alt={currentVideo.title}
          className="w-full h-full object-cover"
          width={300}
          height={300}
        />
      </div>

      {/* Title */}
      <Link href={currentVideo.url} target="_blank" className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white hover:underline">
        {currentVideo.title}
      </Link>

      {/* Description */}
      <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
        {collapsed ? (
          <p>
            {currentVideo.description.slice(0, 400)}{" "}
            <br />
            <span
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              className="text-purple-400 cursor-pointer"
            >
              Read more..
            </span>
          </p>
        ) : (
          <p>
            {currentVideo.description}
            <br />
            <span
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              className="text-purple-400 cursor-pointer"
            >
              Read less..
            </span>
          </p>
        )}
      </div>

      {/* Transcript */}
      <div className="border border-gray-200 dark:border-gray-600 shadow-md pb-0 p-4 rounded-xl gap-4 flex flex-col">
        <p className="text-xl">Transcripts</p>
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto rounded-md p-4">
          {" "}
          {currentVideo.transcript ? (
            currentVideo.transcript.length > 0 &&
            currentVideo.transcript.map((entry, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-sm text-gray-400 min-w-[50px]">
                  {entry.timestamp}
                </span>

                <p className="text-sm text-gray-700 dark:text-gray-500">
                  {entry.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No transcription available
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Video;
