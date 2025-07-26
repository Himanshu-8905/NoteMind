import React from "react";

const Loading = () => {
  return (
    <div className="w-full py-2 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen overflow-y-auto">
      <div className="text-red-400 text-xl w-full py-4 px-5 border border-dashed border-red-400 text-center rounded-md">
        You have no access to view this Project
      </div>
    </div>
  );
};

export default Loading;
