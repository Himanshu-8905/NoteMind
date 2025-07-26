"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import ChatSkeleton from "@/components/ChatSkeleton";
import { Textarea } from "@/components/ui/textarea";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import FileRefs from "@/components/FileRefs";
import { useAppSelector } from "@/lib/store/hooks";
import WelcomeProject from "@/components/WelcomeProject";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { askProjQuestion } from "./actions";
import { getConvexClient } from "@/lib/convex";
import { toast } from "sonner";

import {
  ChevronDownIcon,
  CopyIcon,
  Download,
  Loader2Icon,
  NotebookPenIcon,
  Send,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChatLoading from "./loading";

type fileRefference = {
  type: "sourceCodeEmbedding";
  score: number;
  record: Doc<"sourceCodeEmbedding">;
};

export default function Project() {
  const params = useParams<{ projId: string }>();
  const { projId } = params;
  const msgRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const sendMessage = useMutation(api.messages.send);

  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [fileRefferences, setFileRefferences] = useState<
    {
      type: "sourceCodeEmbedding" | string;
      score: number;
      record: Doc<"sourceCodeEmbedding">;
    }[]
  >([]);

  const currentProject = useQuery(api.project.getProjectById, {
    id: projId as Id<"project">,
  });

  const messages = useQuery(api.messages.getAllMessages, {
    recordId: projId as Id<"project">,
    userId: user?.id ?? "",
  });
  const selectedFiles = useAppSelector((state) => state.SelectedFiles.files);

  useEffect(() => {
    msgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (
    !projId ||
    currentProject === null ||
    currentProject === undefined ||
    messages === undefined ||
    messages === null ||
    !user
  ) {
    return <ChatSkeleton />;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFileRefferences([]);
    e.preventDefault();
    if (
      !projId ||
      currentProject === null ||
      currentProject === undefined ||
      !user
    )
      return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const question = formData.get("project_message");
    await sendMessage({
      isHuman: true,
      recordId: projId as Id<"project">,
      text: question as string,
      isAProject: true,
      userId: user.id,
    });
    const { output, fileRefferences } =
      selectedFiles !== undefined && selectedFiles.length > 0
        ? await askProjQuestion(
            question as string,
            projId,
            user.id,
            selectedFiles
          )
        : await askProjQuestion(question as string, projId, user.id);
    let generatedMsg = "";
    setFileRefferences(fileRefferences);
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        generatedMsg += delta;
      }
    }
    await sendMessage({
      fileRefferences: fileRefferences.map((file) => {
        if (
          file.record.bulletPointSummary &&
          file.record.bulletPointSummary.trim().length === 0
        ) {
          return {
            type: `${file.type}`,
            score: file.score,
            record: {
              fileName: file.record.fileName,
              projectId: file.record.projectId,
              sourceCode: file.record.sourceCode,
              bulletPointSummary: file.record.bulletPointSummary as string,
              userId: file.record.userId,
              summaryEmbedding: file.record.summaryEmbedding,
            },
          };
        } else {
          return {
            type: `${file.type}`,
            score: file.score,
            record: {
              fileName: file.record.fileName,
              projectId: file.record.projectId,
              sourceCode: file.record.sourceCode,
              userId: file.record.userId,
            },
          };
        }
      }),
      isHuman: false,
      recordId: projId as Id<"project">,
      text: generatedMsg,
      isAProject: true,
      userId: user.id,
    });
    setLoading(false);

    generatedMsg = "";
  };

  if (
    !projId ||
    currentProject === null ||
    currentProject === undefined ||
    !selectedFiles ||
    selectedFiles.length === 0
  ) {
    return (
      <main className="py-2 flex flex-col gap-5 justify-start items-start">
        <div className="flex max-[550px]:w-[280px] min-[551px]:w-full flex-col p-3 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
          <div className="block px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex gap-2 justify-start items-start font-semibold text-gray-800 dark:text-gray-300">
              <NotebookPenIcon className="w-5 h-5 md:w-8 md:h-8 text-purple-900 dark:text-purple-400" />
              <span className="text-sm md:text-xl bg-gradient-to-r from-purple-900 dark:from-purple-500 to-purple-400/50 dark:to-purple-200 bg-clip-text text-transparent group-hover:bg-gradient-to-b transition-all duration-300">
                Notes Bot
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 h-full">
            <div className="space-y-6">
              <p className="text-sm text-gray-400">
                Please select a file to continue
              </p>
              <WelcomeProject />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const convex = getConvexClient();

  const addMessageToNote = async (text: string, recordId: string) => {
    try {
      const existingNote = await convex.query(api.note.getNotebyUserAndRecord, {
        recordId: recordId as Id<"project">,
        userId: user.id,
      });
      if (existingNote !== undefined && existingNote !== null) {
        if (existingNote.description.includes(text)) {
          toast.error("Already added to note!");
          return;
        }

        await convex.mutation(api.note.updateNoteById, {
          description: `${existingNote.description}\n---\n${text}`,
          title: existingNote.title,
          noteId: existingNote._id,
          userId: user.id,
        });
        toast.success("Added to note successfully!");
      } else {
        await convex.mutation(api.note.saveNote, {
          link: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/projects/${projId}`,
          description: text,
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
    <main className="py-2 flex flex-col gap-5 justify-start items-start">
      <div className="flex max-[550px]:w-[280px] min-[551px]:w-full flex-col p-3 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
        <div className="block px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex gap-2 justify-start items-start font-semibold text-gray-800 dark:text-gray-300">
            <NotebookPenIcon className="w-5 h-5 md:w-8 md:h-8 text-purple-900 dark:text-purple-400" />
            <span className="text-sm md:text-xl bg-gradient-to-r from-purple-900 dark:from-purple-500 to-purple-400/50 dark:to-purple-200 bg-clip-text text-transparent group-hover:bg-gradient-to-b transition-all duration-300">
              Notes Bot
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 h-full">
          <div className="space-y-6">
            {messages.length !== 0 ? (
              <>
                {messages.map((message, index) => (
                  <div
                    key={message._id}
                    className={`w-full flex flex-col gap-2`}
                  >
                    <MDEditor.Markdown
                      source={message.text}
                      style={{
                        backgroundColor: message.isHuman
                          ? "#0a67dc"
                          : "#23203d",
                        color: "white",
                      }}
                      className={`${message.isHuman ? "w-fit py-4 px-5" : "w-full py-4 px-3"}  border rounded-md shadow-md overflow-auto`}
                    />
                    {!message.isHuman && (
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => {
                                copyText(message.text);
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
                                addMessageToNote(
                                  `\nFile: ${selectedFiles[0].fileName} \n\n\nQuestion :\n${messages[index - 1].text}\n\n\n AI Answer :\n${message.text}`,
                                  currentProject._id as string
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
                    )}
                    {message.fileRefferences && (
                      <FileRefs
                        fileRefferences={
                          message.fileRefferences as fileRefference[]
                        }
                      />
                    )}
                  </div>
                ))}
              </>
            ) : (
              <WelcomeProject />
            )}
          </div>
          <div ref={msgRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-100 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 rounded-md">
          {/* Show the selected file here */}
          {selectedFiles.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-900 my-1 flex justify-start items-start gap-1 rounded-sm py-1 px-2">
              <ChevronDownIcon
                className="cursor-pointer"
                onClick={() => {
                  setOpen(!open);
                }}
              />
              <div className="flex flex-col gap-1 justify-start items-start">
                <span className="font-semibold text-sm">
                  The selected file is :{" "}
                </span>
                <div
                  className={
                    open ? "my-1 flex gap-3 w-full overflow-x-auto" : "hidden"
                  }
                >
                  {selectedFiles.map((file, index) => (
                    <p className="text-sm break-all" key={index}>
                      {file.fileName}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          <form
            onSubmit={onSubmit}
            className="flex flex-wrap gap-2"
            suppressHydrationWarning
          >
            <Textarea
              name="project_message"
              id="project_message"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Ask anything about ${selectedFiles[0].fileName}...`}
              className="flex-1 px-4 py-2 ring-1 ring-gray-300 dark:ring-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-200 text-sm md:text-lg"
              required
              suppressHydrationWarning
            ></Textarea>
            <Button
              className="cursor-pointer disabled:cursor-not-allowed"
              suppressHydrationWarning
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2Icon
                  className="animate-spin"
                  suppressHydrationWarning
                />
              ) : (
                <Send suppressHydrationWarning />
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
