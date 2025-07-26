"use client";

import { Provider } from "react-redux";
import React, { ReactNode, useEffect, useRef } from "react";
import { AppStore, createStore } from "@/lib/store/store";
import { useParams } from "next/navigation";
import { resetStore } from "@/lib/store/slices/selectedFolderSlice";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = createStore();
  }

  const path = useParams();

  useEffect(() => {
    if (storeRef.current) {
      const { SelectedFiles } = storeRef.current.getState();
      if (
        !path.projId ||
        (path.projId &&
          SelectedFiles.files.some((file) => file.projectId !== path.projId))
      ) {
        storeRef.current.dispatch(resetStore());
        // console.log("Reset the store now!");
      }
    }
  }, [path.projId, storeRef.current]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
