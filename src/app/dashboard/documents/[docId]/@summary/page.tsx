"use client";
import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateSummary } from "../@chatDoc/actions";
import { useUser } from "@clerk/nextjs";
import { CopyIcon, Download, Loader2Icon } from "lucide-react";
import { getConvexClient } from "@/lib/convex";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import DocSummaryLoading from "./loading";

const SummaryDoc = () => {
  const params = useParams<{ docId: string }>();
  const { docId } = params;
  const { user } = useUser();
  const currentDoc = useQuery(api.documents.getDocument, {
    docId: docId as Id<"documents">,
  });
  const [loading, setLoading] = useState(false);
  const [docSummary, setDocSummary] = useState("");

  useEffect(() => {
    if (currentDoc && currentDoc.bulletPointSummary) {
      setDocSummary(currentDoc.bulletPointSummary);
    }
  }, [currentDoc]);

  if (!docId || currentDoc === null || currentDoc === undefined || !user) {
    return (
      <>
        <DocSummaryLoading />
      </>
    );
  }

  async function generateDocSummary() {
    try {
      setLoading(true);
      const { output, error } = await generateSummary(docId, user?.id ?? "");
      if (!output || error) {
        throw new Error("Couldn't generate summary");
      }
      setDocSummary(output);
      toast.success("Summary generated!");
    } catch (error) {
      toast.error("Couldn't generate summary!");
    } finally {
      setLoading(false);
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const convex = getConvexClient();

  const addSummaryToNote = async (text: string, recordId: string) => {
    try {
      const existingNote = await convex.query(api.note.getNotebyUserAndRecord, {
        recordId: recordId as Id<"documents">,
        userId: user?.id ?? "",
      });
      if (existingNote !== undefined && existingNote !== null) {
        if (existingNote.description.includes(text)) {
          toast.error("Already added to note!");
          return;
        }

        await convex.mutation(api.note.updateNoteById, {
          description: `${existingNote.description}\n---\n Summary : \n${text}`,
          title: existingNote.title,
          noteId: existingNote._id,
          userId: user.id,
        });
        toast.success("Added to note successfully!");
      } else {
        await convex.mutation(api.note.saveNote, {
          link: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/documents/${docId}`,
          description: `Summary :\n\n${text}`,
          recordTitle: currentDoc.title,
          recordId: recordId as Id<"documents">,
          title: text.slice(0, 50),
          userId: user.id,
        });

        toast.success("Added to note successfully!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col justify-start items-center p-3 pt-10 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
      {docSummary.trim().length === 0 ? (
        <>
          {loading ? (
            <Button className="py-4 px-5 text-lg" disabled>
              <Loader2Icon className="w-8 h-8 animate-spin" /> Generating..
            </Button>
          ) : (
            <Button className="py-4 px-5 text-lg" onClick={generateDocSummary}>
              Generate Summary
            </Button>
          )}
        </>
      ) : (
        <div className="flex h-full">
          <MDEditor.Markdown
            source={docSummary}
            style={{
              backgroundColor: "#23203d",
              color: "white",
            }}
            className={`p-3 border rounded-md shadow-md overflow-auto`}
          />
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  onClick={() => {
                    copyText(docSummary);
                  }}
                >
                  <CopyIcon className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  onClick={() => {
                    addSummaryToNote(docSummary, currentDoc._id as string);
                  }}
                >
                  <Download className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to note</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryDoc;
