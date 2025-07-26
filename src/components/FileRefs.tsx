"use client";
import React, { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { Tabs, TabsContent } from "./ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
// import map from "lang-map";

type Props = {
  fileRefferences: {
    type: "sourceCodeEmbedding";
    score: number;
    record: Doc<"sourceCodeEmbedding">;
  }[];
};

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

export default function FileRefs({ fileRefferences }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(fileRefferences[0]?.record?.fileName);
  if (fileRefferences.length === 0) return null;
  return (
    <div className="w-full ">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-y-auto flex gap-1 bg-gray-300 dark:bg-gray-600 p-1 rounded-md">
          <ChevronDownIcon
            className="cursor-pointer"
            onClick={() => {
              setOpen(!open);
            }}
          />
          {fileRefferences.map((file) => (
            <button
              onClick={() => setTab(file.record.fileName)}
              key={file.record.fileName}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-sm font-normal border border-gray-600 dark:border-gray-300 rounded-md transition-colors whitespace-nowrap hover:bg-gray-400 dark:hover:bg-gray-500",
                {
                  "font-bold bg-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800":
                    tab === file.record.fileName,
                }
              )}
            >
              {file.record.fileName}
            </button>
          ))}
        </div>
        {open ? (
          <>
            {fileRefferences.map((file) => (
              <TabsContent
                key={file.record.fileName}
                value={file.record.fileName}
                className={`h-fit py-3 px-2 overflow-y-auto w-full rounded-md `}
              >
                <SyntaxHighlighter
                  language={getLanguageFromFilename(file.record.fileName)}
                  style={vscDarkPlus}
                  showLineNumbers
                >
                  {file.record.sourceCode}
                </SyntaxHighlighter>
              </TabsContent>
            ))}
          </>
        ) : (
          <></>
        )}
      </Tabs>
    </div>
  );
}
