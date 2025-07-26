"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2Icon, UploadCloudIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

type DocumentInput = {
  document_title: string;
  document_file: FileList;
};

export default function UploadDocument() {
  const pathName = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, reset, formState } = useForm<DocumentInput>();
  async function onSubmit(data: DocumentInput) {
    console.log(data);
    if (!user) return;

    const file = data.document_file[0];
    //Extract file extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    console.log("File extension:", extension);

    const allowedExtensions = [
      "pdf",
      "txt",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "xml",
    ];
    if (!allowedExtensions.includes(extension!)) {
      toast.error("Unsupported file type.");
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      toast.error("File size should not exceed 20MB.");
      return;
    }

    const formData = new FormData();
    formData.append("document_title", data.document_title);
    formData.append("document_file", data.document_file[0]);
    formData.append("file_type", extension!);

    const storeDoc = await fetch("/api/uploadDoc", {
      method: "POST",
      body: formData,
    });

    if (storeDoc.status !== 200) {
      toast.error("Something went wrong! please try again.");
      reset();
      return;
    }

    if (storeDoc.status === 200 && btnRef.current) {
      btnRef.current.click();
      toast.success("Document uploaded successfully!");
      const { message, docRecordId } = await storeDoc.json();
      if (docRecordId) {
        router.push(`/dashboard/documents/${docRecordId}`);
      } else {
        return;
      }
      return;
    }
  }

  return (
    <Dialog
      defaultOpen={
        formState.isSubmitting || formState.isLoading || formState.isValidating
      }
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer flex gap-2 justify-center items-center bg-blue-500 dark:bg-blue-400 dark:hover:bg-blue-500 hover:bg-blue-600">
          <UploadCloudIcon suppressHydrationWarning />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload a Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <Input
            id="document_title"
            type="text"
            placeholder="Title"
            className="col-span-3"
            {...register("document_title", {
              required: true,
              minLength: 3,
              maxLength: 25,
            })}
            disabled={
              formState.isSubmitting ||
              formState.isLoading ||
              formState.isValidating
            }
            required
          />
          {formState.errors.document_title ? (
            <span className="text-sm text-red-400">
              Title should be atleast of 3 characters and maximum of 25
              characters
            </span>
          ) : (
            <></>
          )}
          <Input
            id="document_file"
            type="file"
            className="col-span-3"
            accept=".txt,.pdf,.docx,.xls,.xlsx,.csv,.xml"
            {...register("document_file", { required: true, maxLength: 1 })}
            disabled={
              formState.isSubmitting ||
              formState.isLoading ||
              formState.isValidating
            }
            required
          />
          {formState.isSubmitting ||
          formState.isLoading ||
          formState.isValidating ? (
            <Button
              type="submit"
              className="flex gap-2 cursor-pointer justify-center items-end"
            >
              Uploading{" "}
              <Loader2Icon className="animate-spin" suppressHydrationWarning />
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                className="flex gap-2 cursor-pointer justify-center items-end"
              >
                Upload <ArrowRight suppressHydrationWarning />
              </Button>
              <Button
                variant={"outline"}
                type="reset"
                className="flex gap-2 cursor-pointer justify-center items-end"
              >
                Reset
              </Button>
            </>
          )}
          <DialogClose ref={btnRef} className="hidden" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
