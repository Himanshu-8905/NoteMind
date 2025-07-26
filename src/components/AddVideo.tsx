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
import { ArrowRight, Loader2Icon, PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Video_Input = {
  link: string;
};

export default function AddVideo() {
  const pathName = usePathname();
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, reset, formState } = useForm<Video_Input>();

  async function onSubmit(data: Video_Input) {
    try {
      const response = await fetch("/api/addVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: data.link }),
      });

      if (!response.ok) {
        toast.error("Error : Something went wrong!.");
        if (btnRef.current) {
          btnRef.current.click();
        }
        reset();
        return;
      }
      toast.success("Video added successfully!");
      if (btnRef.current) {
        btnRef.current.click();
      }
      reset();
      const { message, videoId } = await response.json();
      if (videoId) {
        router.push(`/dashboard/videos/${videoId}`);
      } else {
        return;
      }
    } catch (error: any) {
      console.error("Upload error:", error.message);
      toast.error("Error : Something went wrong!.");
      reset();
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500">
          <PlusIcon suppressHydrationWarning />
          Add Youtube Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Youtube Video</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          id="add_note"
          className="grid gap-4 py-4"
          suppressHydrationWarning
        >
          <Input
            id="link"
            placeholder="Video link"
            className="col-span-3"
            {...register("link", {
              required: true,
              pattern:
                /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?$/,
            })}
            required
          />
          {formState.errors.link ? (
            <span className="text-sm text-red-400">Not a youtube video!</span>
          ) : (
            <></>
          )}
          {formState.isSubmitting ||
          formState.isLoading ||
          formState.isValidating ? (
            <Button
              type="submit"
              className="flex gap-2 cursor-pointer justify-center items-end"
            >
              Adding{" "}
              <Loader2Icon className="animate-spin" suppressHydrationWarning />
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                className="flex gap-2 cursor-pointer justify-center items-end"
              >
                Add Video <ArrowRight suppressHydrationWarning />
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
