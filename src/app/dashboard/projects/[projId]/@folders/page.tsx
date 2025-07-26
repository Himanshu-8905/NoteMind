"use client";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { FoldersIcon } from "lucide-react";
import FolderTree from "@/components/FolderTree"; // adjust the path

import FolderLoader from "@/components/FolderLoader";
import { useUser } from "@clerk/clerk-react";

export default function Folders() {
  const params = useParams<{ projId: string }>();
  const { projId } = params;
  const { user } = useUser();

  const currentProject = useQuery(api.project.getProjectById, {
    id: projId as Id<"project">,
  });

  const allCodeFiles = useQuery(api.sourceCodeEmbedding.getAllCodeFiles, {
    projectId: currentProject?._id as Id<"project">,
    userId: user?.id as string,
  });

  if (
    !projId ||
    currentProject === null ||
    currentProject === undefined ||
    allCodeFiles === null ||
    allCodeFiles === undefined ||
    !user
  ) {
    return <FolderLoader />;
  }

  return (
    <div className="flex flex-col gap-3 py-1.5 px-2 shadow-sm border-[.3px] border-gray-200 dark:border-gray-600 rounded-md">
      <div className="flex gap-2">
        <FoldersIcon className="text-yellow-600 dark:text-yellow-500" />{" "}
        <h1 className="text-semibold text-gray-500 dark:text-gray-300 text-sm md:text-lg">
          Project Files
        </h1>
      </div>
      <hr />
      <div className="flex flex-col gap-3 h-[400px] overflow-y-auto">
      {allCodeFiles.length > 0 && <FolderTree files={allCodeFiles} />}

      </div>
    </div>
  );
}
