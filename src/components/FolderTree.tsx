"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addFile, removeFile } from "@/lib/store/slices/selectedFolderSlice";
import { Doc } from "../../convex/_generated/dataModel";

interface FolderTreeProps {
  files: Doc<"sourceCodeEmbedding">[];
}

const FolderTree: React.FC<FolderTreeProps> = ({ files }) => {
  const dispatch = useAppDispatch();
  const selectedfiles = useAppSelector((state) => state.SelectedFiles.files);
  const selectedFileId = selectedfiles[0]?._id; // single selection

  const handleSelect = (file: Doc<"sourceCodeEmbedding">) => {
    if (selectedFileId === file._id) {
      dispatch(removeFile(file));
    } else {
      // Remove the previously selected file before adding the new one
      if (selectedfiles.length > 0) {
        dispatch(removeFile(selectedfiles[0]));
      }
      dispatch(addFile(file));
    }
  };

  return (
    <ul className="pl-4 w-fit pb-1.5 flex flex-col justify-start items-start gap-2 font-mono text-xs">
      {files.map((file) => (
        <li key={file._id}>
          <label className="break-all flex items-center gap-2 cursor-pointer hover:text-blue-500 dark:hover:text-blue-600">
            <input
              type="checkbox"
              checked={selectedFileId === file._id}
              onChange={() => handleSelect(file)}
            />
            <span>{file.fileName}</span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default FolderTree;
