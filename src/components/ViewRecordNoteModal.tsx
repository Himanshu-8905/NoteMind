"use client";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MDEditor from "@uiw/react-md-editor";
import { marked } from "marked";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { QuizModal } from "./QuizModal";

export default function ViewRecordNoteModal({
  recordId,
  userId,
}: {
  recordId: Id<"project">|Id<"documents">|Id<"video">;
  userId: string;
}) {
  const note = useQuery(api.note.getNotebyUserAndRecord, { recordId, userId });
  const isLoading = note === undefined;
  const notFound = note === null;

  const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null);

  useEffect(() => {
    // Dynamically import html2pdf.js on client
    import("html2pdf.js").then((mod) => {
      setHtml2pdfInstance(() => mod.default);
    });
  }, []);

  const handleExportPDF = () => {
    if (!html2pdfInstance || !note) return;

    const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="font-size: 24px;">${note.title}</h1>
      ${note.link ? `<p><strong>Link:</strong> <a href="${note.link}">${note.link}</a></p>` : ""}
      <hr />
      <div>${marked(note.description)}</div>
    </div>`;

    const opt: any = {
      margin: 0.5,
      filename: `${note.title || "note"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdfInstance().set(opt).from(htmlContent).save();
  };

  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        <span className="text-sm text-purple-500 dark:text-purple-300 hover:underline cursor-pointer">
          View Note
        </span>
      </DialogTrigger>

      <DialogContent
        className="w-[90vw] max-w-2xl h-[500px] px-4 overflow-y-auto"
        suppressHydrationWarning
      >
        <DialogHeader>
          <DialogTitle>
            {isLoading && "Loading..."}
            {notFound && "Note Not Found"}
            {!isLoading && !notFound && note.title}
          </DialogTitle>

          {!isLoading && !notFound && note.link && (
            <DialogDescription>
              <Link
                href={note.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-500 break-all"
              >
                {note.link}
              </Link>
            </DialogDescription>
          )}
        </DialogHeader>
        {!isLoading && !notFound && (
          <div className="text-sm break-words w-full overflow-y-auto space-y-3">
            <div className="flex gap-3 justify-end mb-2">
               <QuizModal noteDescription={note.description} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    className="border-none outline-none"
                    onClick={handleExportPDF}
                  >
                    <Download className="cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export as PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="p-4 rounded-md space-y-4">
              <h2 className="text-lg font-semibold text-gray-500">
                Description:
              </h2>

              <MDEditor.Markdown
                source={note.description}
                style={{
                  backgroundColor: "#23203d",
                  color: "white",
                }}
                className="py-4 px-5 border rounded-md shadow-md markdown-preview"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
