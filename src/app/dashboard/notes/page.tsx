"use client";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import {
  Calendar1Icon,
  Download,
  Edit2Icon,
  FileBoxIcon,
  LucideEye,
  SquareArrowOutUpRight,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { marked } from "marked";
import { QuizModal } from "@/components/QuizModal";

function DeleteDialog({
  noteId,
  docName,
  userId,
}: {
  noteId: Id<"note">;
  docName: string;
  userId: string;
}) {
  const deleteHandler = useMutation(api.note.deleteNoteById);
  const handleDelete = async () => {
    const deleteDoc = await deleteHandler({
      id: noteId,
      userId,
    })
      .then(() => {
        toast.success("Note deleted successfully!");
      })
      .catch((error) => {
        console.log("Error deleting note : ", error);
        toast.error("Something went wrong! Try again later.");
      });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Trash2Icon
          className="cursor-pointer text-red-400"
          suppressHydrationWarning
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to delete note : {docName} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your note
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="cursor-pointer" onClick={handleDelete}>
            Delete{" "}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditNoteModal({
  noteId,
  userId,
}: {
  noteId: Id<"note">;
  userId: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const note = useQuery(api.note.getNoteById, { noteId, userId });
  const updateNote = useMutation(api.note.updateNoteById);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    try {
      await updateNote({
        noteId,
        userId,
        title,
        description,
        link,
      });
      toast.success("Note updated successfully!");
      if (btnRef.current) {
        btnRef.current.click();
      }
    } catch (error) {
      console.error("Update note error:", error);
      toast.error("Failed to update the note.");
    }
  };

  // Pre-fill form once note is loaded
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setDescription(note.description);
      setLink(note.link ?? "");
    }
  }, [note]);

  return (
    <Dialog>
      <DialogTrigger asChild suppressHydrationWarning>
        <Edit2Icon className="w-6 h-6 cursor-pointer text-cyan-500" />
      </DialogTrigger>
      <DialogContent className="max-w-lg" suppressHydrationWarning>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Update your note title, description, or resource link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-400">Title</p>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Description
          </p>
          <Textarea
            placeholder="Description (Markdown supported)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
          <p className="text-sm text-gray-700 dark:text-gray-400">Link</p>
          <Input
            placeholder="Optional Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button className="w-full" onClick={handleUpdate}>
            Save Changes
          </Button>
          <DialogClose className="hidden" ref={btnRef} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewNoteModal({
  noteId,
  userId,
}: {
  noteId: Id<"note">;
  userId: string;
}) {
  const note = useQuery(api.note.getNoteById, { noteId, userId });
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
        <span className="py-3 px-5 text-sm bg-black text-white dark:bg-white/95 dark:text-black rounded-lg flex gap-2 justify-center items-center cursor-pointer">
          <LucideEye className="w-4 h-4" />
          View
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

export default function Notes() {
  const { user } = useUser();
  const docs = useQuery(api.note.getAllNotes);

  return (
    <main className="flex flex-col gap-4 justify-center items-start">
      <div className="flex w-full justify-between items-center">
        <p className="text-2xl font-semibold">My Notes</p>
      </div>
      <div className="w-full mt-4 border border-gray-300 dark:border-gray-700" />
      {!user || docs === undefined || docs === null ? (
        <div className="w-full py-2 md:px-3 flex gap-4 flex-wrap">
          {[...new Array(5)].map((e, index) => (
            <div
              key={index}
              className="flex gap-3 flex-col py-3 px-4 justify-start items-start rounded-lg border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-blue-950/50 min-w-[200px] h-[150px] max-w-[280px] animate-pulse"
            >
              <div className="flex w-full justify-between items-start">
                <span className="w-20 h-8 rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse" />

                <span className="bg-red-400 py-2 px-4 rounded-md animate-pulse" />
              </div>
              <span className="w-30 h-4 bg-gray-600 dark:bg-gray-400 rounded-md animate-pulse" />

              <div className="mt-3 w-8 h-8 py-3 px-5 bg-black dark:bg-white/95 rounded-lg flex gap-2 justify-center items-center animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-2 md:px-3 flex gap-4 flex-wrap">
          {docs.length === 0 ? (
            <div className="py-12 w-full px-5 text-xl text-gray-400 text-center border border-gray-400 dark:border-gray-700 border-dashed rounded-md">
              No Notes Found
            </div>
          ) : (
            <>
              {docs.map((doc) => (
                <div
                  key={doc._id}
                  className="flex gap-3 flex-col py-3 px-4 justify-start items-start rounded-lg border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-blue-950/50 min-w-[200px] max-w-[280px]"
                >
                  <div className="w-full flex flex-col gap-1 5 justify-start items-start">
                    <div className="flex justify-between items-start w-full">
                      <span className="flex items-center gap-2 text-purple-800 dark:text-purple-300 text-xs">
                        <Calendar1Icon className="text-purple-800 dark:text-purple-300 w-3 h-3" />
                        {new Date(doc._creationTime).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 text-xs">
                        <FileBoxIcon className="text-cyan-800 dark:text-cyan-300 w-3 h-3" />
                        <span className="font-semibold">
                          {doc.recordTitle.slice(0, 15)}..
                        </span>
                      </span>
                    </div>
                    <div className="flex gap-1.5 w-full justify-between items-end">
                      <span
                        style={{ overflowWrap: "anywhere" }}
                        className="text-lg font-semibold inline-flex whitespace-pre-wrap"
                      >
                        {doc.title.slice(0, 20)}..
                      </span>
                      <DeleteDialog
                        noteId={doc._id}
                        docName={doc.title}
                        userId={user?.id as string}
                      />
                      <EditNoteModal noteId={doc._id} userId={user.id} />
                    </div>
                  </div>
                  <span
                    style={{ overflowWrap: "anywhere" }}
                    className="text-sm text-gray-600 dark:text-gray-400 inline-flex whitespace-pre-wrap"
                  >
                    {doc.description.slice(0, 50)}
                  </span>
                  {doc.link && (
                    <Link
                      href={`${doc.link}`}
                      className="text-sm hover:underline flex gap-2 justify-center items-center"
                      target="_blank"
                    >
                      <SquareArrowOutUpRight
                        className="w-4 h-4"
                        suppressHydrationWarning
                      />
                      Visit link
                    </Link>
                  )}
                  <ViewNoteModal noteId={doc._id} userId={user.id} />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
}
