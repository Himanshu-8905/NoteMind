import React from "react";

const ProjectSummaryLoading = () => {
  return (
    <div className="flex justify-center items-start h-screen">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-64 h-6 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="w-96 h-40 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="w-20 h-6 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
};

export default ProjectSummaryLoading;
