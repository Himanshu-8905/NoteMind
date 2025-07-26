import React from "react";

const VideoLoading = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 rounded-xl"></div>

      {/* Title Skeleton */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 w-2/3 rounded-md"></div>

      {/* Description Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      {/* Transcript Skeleton */}
      <div className="border border-gray-200 dark:border-gray-600 shadow-md p-4 rounded-xl space-y-3">
        <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-12 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoLoading;
