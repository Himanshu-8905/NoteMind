"use client";

import UploadDocument from "@/components/UploadDocument";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Calendar1Icon, LucideEye, Trash2Icon } from "lucide-react";
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
import ViewRecordNoteModal from "@/components/ViewRecordNoteModal";

function DeleteDialog({
  docId,
  docName,
  userId,
}: {
  docId: Id<"documents">;
  docName: string;
  userId: string;
}) {
  const deleteHandler = useMutation(api.documents.deleteDocById);
  const handleDelete = async () => {
    const deleteDoc = deleteHandler({
      id: docId,
      userId,
    })
      .then(() => {
        toast.success("Document deleted successfully!");
      })
      .catch((error) => {
        console.log("Error deleting document : ", error);
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
            Are you sure to delete document : {docName} ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            document data from our servers.
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

export default function Documents() {
  const { user } = useUser();
  const docs = useQuery(api.documents.getAllDocuments);

  return (
    <main className="flex flex-col gap-4 justify-center items-start">
      <div className="flex flex-wrap gap-3 w-full justify-between items-center">
        <p className="text-3xl font-semibold">My Documents</p>
        <UploadDocument />
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
              No Documents Found
            </div>
          ) : (
            <>
              {docs.map((doc) => (
                <div
                  key={doc._id}
                  className="flex gap-3 flex-col py-3 px-4 justify-start items-start rounded-lg border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-blue-950/50 min-w-[200px] max-w-[280px]"
                >
                  <div className="w-full flex flex-col gap-1 5 justify-start items-start">
                    <span className="flex items-center gap-2 text-purple-800 dark:text-purple-300 text-xs">
                      <Calendar1Icon className="text-purple-800 dark:text-purple-300 w-3 h-3" />
                      {new Date(doc._creationTime).toLocaleDateString()}
                    </span>
                    <div className="flex w-full justify-between items-end">
                      <span
                        style={{ overflowWrap: "anywhere" }}
                        className="text-lg font-semibold inline-flex whitespace-pre-wrap"
                      >
                        {doc.title}
                      </span>
                      <DeleteDialog
                        docId={doc._id}
                        docName={doc.title}
                        userId={user?.id as string}
                      />
                    </div>
                  </div>
                  <span
                    style={{ overflowWrap: "anywhere" }}
                    className="text-sm text-gray-600 dark:text-gray-400 inline-flex whitespace-pre-wrap"
                  >
                    {doc.description}
                  </span>
                  <Link
                    href={`/dashboard/documents/${doc._id}`}
                    className="mt-3 py-3 px-5 text-sm bg-black text-white dark:bg-white/95 dark:text-black rounded-lg flex gap-2 justify-center items-center"
                  >
                    <LucideEye className="w-4 h-4" suppressHydrationWarning />
                    View
                  </Link>
                  <div className="w-full">
                    <ViewRecordNoteModal recordId={doc._id} userId={user.id} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
}
