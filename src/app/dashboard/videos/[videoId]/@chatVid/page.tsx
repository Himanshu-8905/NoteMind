"use client";

import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  CopyIcon,
  Download,
  Loader2Icon,
  NotebookPenIcon,
  Send,
} from "lucide-react";
import ChatSkeleton from "@/components/ChatSkeleton";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { useUser } from "@clerk/clerk-react";
import { readStreamableValue } from "ai/rsc";
import WelcomeDoc from "@/components/WelcomeDoc";
import { toast } from "sonner";
import { getConvexClient } from "@/lib/convex";
import { askQuestion } from "./actions";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WelcomeVideo from "@/components/WelcomeVideo";

export default function ChatVid() {
  const msgRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ videoId: string }>();
  const { videoId } = params;
  const { user } = useUser();

  const sendMessage = useMutation(api.messages.send);

  const addToNote = useMutation(api.note.saveNote);

  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const currentVideo = useQuery(api.video.getVideoById, {
    videoRecordId: videoId as Id<"video">,
  });

  const messages = useQuery(api.messages.getAllMessages, {
    recordId: videoId as Id<"video">,
    userId: user?.id ?? "",
  });

  useEffect(() => {
    msgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (
    !videoId ||
    currentVideo === null ||
    currentVideo === undefined ||
    messages === undefined ||
    messages === null ||
    !user
  ) {
    return <ChatSkeleton />;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setAnswer("");
    e.preventDefault();
    if (
      !videoId ||
      currentVideo === null ||
      currentVideo === undefined ||
      !user
    )
      return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const question = formData.get("video_message");
    await sendMessage({
      isHuman: true,
      recordId: videoId as Id<"video">,
      text: question as string,
      isAProject: false,
      userId: user.id,
    });
    const { output } = await askQuestion(question as string, videoId, user.id);

    let generatedMsg = "";

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        generatedMsg += delta;
      }
    }
    await sendMessage({
      isHuman: false,
      recordId: videoId as Id<"video">,
      text: generatedMsg,
      isAProject: false,
      userId: user.id,
    });
    setLoading(false);

    generatedMsg = "";
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const convex = getConvexClient();

  const addMessageToNote = async (text: string, recordId: string) => {
    try {
      const existingNote = await convex.query(api.note.getNotebyUserAndRecord, {
        recordId: recordId as Id<"video">,
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
        await addToNote({
          link: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/videos/${videoId}`,
          description: text,
          recordTitle: currentVideo.title,
          recordId: recordId as Id<"video">,
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
    <div className="flex flex-col p-3 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
      <div className="block px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-2 justify-start items-start font-semibold text-gray-800 dark:text-gray-300">
          <NotebookPenIcon className="w-8 h-8 text-purple-900 dark:text-purple-400" />
          <span className="text-xl bg-gradient-to-r from-purple-900 dark:from-purple-500 to-purple-400/50 dark:to-purple-200 bg-clip-text text-transparent group-hover:bg-gradient-to-b transition-all duration-300">
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
                  key={index}
                  className={`w-full flex flex-col gap-4 ${message.isHuman === true && "justify-end"}`}
                >
                  <MDEditor.Markdown
                    source={message.text}
                    style={{
                      backgroundColor: message.isHuman ? "#0a67dc" : "#23203d",
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
                                `Question :\n${messages[index - 1].text}\n\n\n AI Answer :\n${message.text}`,
                                currentVideo._id as string
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
                </div>
              ))}
            </>
          ) : (
            <WelcomeVideo />
          )}
        </div>
        <div ref={msgRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-100 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 rounded-md">
        <form
          onSubmit={onSubmit}
          className="flex flex-wrap gap-2"
          suppressHydrationWarning
        >
          <Textarea
            name="video_message"
            id="video_message"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={`Ask anything about ${currentVideo.title}...`}
            className="flex-1 px-4 py-2 ring-1 ring-gray-300 dark:ring-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-200 text-lg"
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
              <Loader2Icon className="animate-spin" suppressHydrationWarning />
            ) : (
              <Send suppressHydrationWarning />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
