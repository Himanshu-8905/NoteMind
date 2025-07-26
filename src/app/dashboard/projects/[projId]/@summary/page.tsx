"use client";
import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { toast } from "sonner";
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
import { useAppSelector } from "@/lib/store/hooks";
import { generateCodeFileSummary } from "../actions";

const SummaryProj = () => {
  const params = useParams<{ projId: string }>();
  const { projId } = params;
  const { user } = useUser();

  const currentProject = useQuery(api.project.getProjectById, {
    id: projId as Id<"project">,
  });

  const selectedFiles = useAppSelector((state) => state.SelectedFiles.files);
  const [loading, setLoading] = useState(false);
  const [codeFileSummary, setcodeFileSummary] = useState("");

  useEffect(() => {
    if (
      currentProject &&
      selectedFiles &&
      selectedFiles[0] &&
      selectedFiles[0].bulletPointSummary &&
      selectedFiles[0].bulletPointSummary.trim().length > 0
    ) {
      setcodeFileSummary(selectedFiles[0].bulletPointSummary);
    }
  }, [currentProject, selectedFiles]);

  if (
    !projId ||
    currentProject === null ||
    currentProject === undefined ||
    selectedFiles.length === 0 ||
    !user
  ) {
    return (
      <div className="flex flex-col justify-start items-center p-3 pt-10 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
        <MDEditor.Markdown
          source={
            "\n\n\n------\n\n\nPlease select a code file to generate summary!\n\n\n-----\n\n\n"
          }
          style={{
            backgroundColor: "#23203d",
            color: "white",
          }}
          className={`p-3 border rounded-md shadow-md overflow-auto`}
        />
      </div>
    );
  }

  async function generatecodeFileSummary() {
    try {
      setLoading(true);
      const { summary, error } = await generateCodeFileSummary(
        selectedFiles[0]._id,
        user?.id ?? ""
      );
      if (!summary || error) {
        throw new Error("Couldn't generate summary");
      }
      setcodeFileSummary(summary);
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

  const addSummaryToNote = async (
    text: string,
    recordId: string,
    recordTitle: string
  ) => {
    try {
      const existingNote = await convex.query(api.note.getNotebyUserAndRecord, {
        recordId: recordId as Id<"project">,
        userId: user?.id ?? "",
      });
      if (existingNote !== undefined && existingNote !== null) {
        if (existingNote.description.includes(text)) {
          toast.error("Already added to note!");
          return;
        }

        await convex.mutation(api.note.updateNoteById, {
          description: `${existingNote.description}\n---\nSummary of ${recordTitle} :\n${text}`,
          title: existingNote.title,
          noteId: existingNote._id,
          userId: user.id,
        });
        toast.success("Added to note successfully!");
      } else {
        await convex.mutation(api.note.saveNote, {
          link: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/projects/${projId}`,
          description: `\nSummary of ${recordTitle} :\n\n${text}`,
          recordTitle: currentProject.name,
          title: text.slice(0, 50),
          userId: user.id,
          recordId: recordId as Id<"project">,
        });

        toast.success("Added to note successfully!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col justify-start items-center p-3 pt-10 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
      {codeFileSummary.trim().length === 0 ? (
        <>
          {loading ? (
            <Button className="py-4 px-5 text-lg" disabled>
              <Loader2Icon className="w-8 h-8 animate-spin" /> Generating..
            </Button>
          ) : (
            <div className="flex flex-col gap-5 justify-center items-center">
              <Button
                className="py-4 px-5 text-lg"
                onClick={generatecodeFileSummary}
              >
                Generate Summary
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Summarize the file : {selectedFiles[0].fileName}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full">
          <MDEditor.Markdown
            source={codeFileSummary}
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
                    copyText(codeFileSummary);
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
                    addSummaryToNote(
                      codeFileSummary,
                      currentProject._id as string,
                      selectedFiles[0].fileName
                    );
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

export default SummaryProj;
