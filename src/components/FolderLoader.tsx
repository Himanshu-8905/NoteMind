import React from "react";

const FolderLoader = () => {
  return (
    <div className="flex flex-col gap-3 py-1.5 px-3 shadow-sm border-[.3px] border-gray-200 dark:border-gray-600 rounded-md">
      <div className="w-full h-8 pr-5 grid grid-cols-5 gap-2">
        <div className="h-full col-span-1 rounded-md animate-pulse bg-yellow-600 dark:bg-yellow-500" />{" "}
        <div className="h-full col-span-3 rounded-md animate-pulse bg-gray-400 " />
      </div>
      <hr />
      <ul className="pl-4 h-fit pb-1.5 px-3 flex flex-col justify-start items-start gap-2">
        {[...Array(10)].map((_, index) => (
          <label
            key={index}
            className="grid grid-cols-5 w-full h-4  items-center gap-3 hover:text-blue-500 dark:hover:text-blue-600"
          >
            <div className="col-span-1 h-full rounded-md animate-pulse bg-gray-400" />
            <div className="col-span-3 h-full rounded-md animate-pulse bg-gray-400" />
          </label>
        ))}
      </ul>
    </div>
  );
};

export default FolderLoader;
