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
import { getConvexClient } from "@/lib/convex";
import { useUser } from "@clerk/clerk-react";
import { ArrowRight, Loader2Icon, PlusIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { indexGithubRepo } from "@/actions/project-actions";
import { usePathname, useRouter } from "next/navigation";

type ProjectInput = {
  project_title: string;
  project_link: string;
  branch: string;
  gh_token?: string;
};

const convex = getConvexClient();

export default function AddProject() {
  const pathName = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { register, handleSubmit, reset, formState } = useForm<ProjectInput>();

  async function createNewProject(
    name: string,
    githubUrl: string,
    branch: string,
    githubToken?: string
  ) {
    const projectId =
      githubToken !== undefined
        ? await convex.mutation(api.project.createProject, {
            userId: user?.id ?? "",
            name,
            githubUrl,
            branch,
            githubToken,
          })
        : await convex.mutation(api.project.createProject, {
            userId: user?.id ?? "",
            name,
            githubUrl,
            branch,
          });
    return projectId;
  }

  async function onSubmit(data: ProjectInput) {
    try {
      if (!user) {
        throw new Error("Not authenticated! client");
      }
      const projectId = await createNewProject(
        data.project_title,
        data.project_link,
        data.branch,
        data.gh_token
      );
      if (projectId === null) {
        toast.error("Error : Project already exists.");
        if (btnRef.current) {
          btnRef.current.click();
        }
        reset();
        return;
      }

      const { error, success } = await indexGithubRepo(
        user.id,
        projectId,
        data.project_link,
        data.branch,
        data.gh_token
      );

      if (error) {
        // delete project if repo indexing fails
        await convex.mutation(api.project.deleteProjectById, {
          id: projectId,
          userId: user.id,
        });
        toast.error(
          "Error occurred while adding project. Please try again later."
        );
        if (btnRef.current) {
          btnRef.current.click();
        }
        reset();
        return;
      }
      //success
      if (btnRef.current) {
        btnRef.current.click();
      }
      toast.success("Project added successfully!");
      router.push(`/dashboard/projects/${projectId}`);
    } catch (error) {
      toast.error(
        "Error occurred while adding project. Please try again later."
      );
      reset();
      console.log("Error : ", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-purple-700 hover:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600">
          <PlusIcon suppressHydrationWarning />
          Add Github Repo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Github Repo</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          id="add_project"
          className="grid gap-4 py-4"
          suppressHydrationWarning
        >
          <Input
            id="project_title"
            type="text"
            placeholder="Title"
            className="col-span-3"
            {...register("project_title", { required: true })}
            required
          />
          <Input
            id="project_link"
            placeholder="Link of Github Repo"
            className="col-span-3"
            {...register("project_link", {
              required: true,
              pattern:
                /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\/|$)/,
            })}
            required
          />
          {formState.errors.project_link ? (
            <span className="text-sm text-red-400">
              Not a valid github link!
            </span>
          ) : (
            <></>
          )}
          <Input
            id="branch"
            placeholder="Branch Name"
            className="col-span-3"
            {...register("branch", { required: true })}
            required
          />
          <Input
            id="gh_token"
            placeholder="Github Token (optional: for private repos)"
            className="col-span-3"
            {...register("gh_token", { required: false })}
          />

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
                Add Project <ArrowRight suppressHydrationWarning />
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
