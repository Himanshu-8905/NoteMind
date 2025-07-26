"use client";
import WelcomeCodeFile from "@/components/WelcomeCodeFile";
import { useAppSelector } from "@/lib/store/hooks";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";


function getLanguageFromFilename(filename: string): string {
  const extension = filename.split(".").pop();

  switch (extension) {
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "py":
      return "python";
    case "php":
      return "php";
    case "dart":
      return "dart";

    default:
      return "auto";
  }
}

export default function File() {
  const selectedFiles = useAppSelector((state) => state.SelectedFiles.files);
  return (
    <div
      className={`w-full h-screen py-2 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md overflow-y-auto`}
    >
      {selectedFiles !== undefined && selectedFiles.length > 0 ? (
        <>
          <div className="overflow-y-auto flex justify-start items-center gap-1 bg-gray-300 dark:bg-gray-600 p-1 rounded-md">
              <button
                key={selectedFiles[0].fileName}
                className={
                  "cursor-pointer px-3 py-1.5 text-sm border border-gray-600 dark:border-gray-300 rounded-md transition-colors whitespace-nowrap  font-bold bg-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800"
                }
              >
                {selectedFiles[0].fileName}
              </button>
           
          </div>
          
            <SyntaxHighlighter
              language={getLanguageFromFilename(selectedFiles[0].fileName)}
              style={vscDarkPlus}
              showLineNumbers
            >
              {selectedFiles[0].sourceCode}
            </SyntaxHighlighter>
          
        </>
      ) : (
        <div className="flex flex-col gap-5 justify-center items-center">
          <WelcomeCodeFile />
          <p className="text-gray-400">No file has been selected yet!</p>
        </div>
      )}
    </div>
  );
}
