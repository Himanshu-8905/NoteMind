"use client";
import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

export default function Doc() {
  const params = useParams<{ docId: string }>();
  const { docId } = params;
  const currentDoc = useQuery(api.documents.getDocument, {
    docId: docId as Id<"documents">,
  });

  if (!docId || currentDoc === null || currentDoc === undefined) {
    return (
      <div className="text-red-400 text-xl w-full py-4 px-5 border border-dashed border-red-400 text-center rounded-md">
        You have no access to view this document
      </div>
    );
  }

  return (
    <main className="py-2 flex flex-col gap-5 justify-start items-start h-screen">
      <div className="flex flex-col gap-2 justify-start items-start">
        <h1 className="font-semibold text-2xl">{currentDoc.title}</h1>
        <span className="text-lg text-gray-400 dark:text-gray-500 inline-flex break-words">
          {currentDoc.description}
        </span>
      </div>

      {currentDoc.url &&
        (currentDoc.fileType === "pdf" || currentDoc.fileType === "txt") && (
          <div className="py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-800 w-full h-screen">
            <iframe className="w-full h-full" src={currentDoc.url}></iframe>
          </div>
        )}
      {currentDoc.url && currentDoc.fileType === "docx" && (
        <div className="py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-800 w-full h-screen">
          <DocViewer
            documents={[{ uri: currentDoc.url, fileType: "docx" }]}
            pluginRenderers={DocViewerRenderers}
            config={{ header: { disableHeader: true } }}
            className="h-full"
          />
        </div>
      )}
      {currentDoc.url &&
        (currentDoc.fileType === "xlsx" || currentDoc.fileType === "xls") && (
          <div className="py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-800 w-full h-screen">
            <DocViewer
              documents={[{ uri: currentDoc.url, fileType: "xlsx" }]}
              pluginRenderers={DocViewerRenderers}
              config={{ header: { disableHeader: true } }}
              className="h-full"
            />
          </div>
        )}
    </main>
  );
}
