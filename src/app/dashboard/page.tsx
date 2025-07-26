"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import AddProject from "@/components/AddProject";
import UploadDocument from "@/components/UploadDocument";
import Notes from "./notes/page";
import AddVideo from "@/components/AddVideo";

function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Type to search note...."
        suppressHydrationWarning
        required
      />
      <Button type="button" className="cursor-pointer" suppressHydrationWarning>
        <SearchIcon suppressHydrationWarning /> Search
      </Button>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <div className="flex flex-col gap-5 justify-start items-start w-full">
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <div className="flex gap-10 justify-between px-4 items-start w-full">
          <div className="flex flex-col w-full justify-start items-start gap-4">
            <div className="flex flex-wrap gap-2 justify-start items-start">
              <UploadDocument />
              Or
              <AddProject />
              Or
              <AddVideo />
            </div>
            &nbsp;
            <Notes />
          </div>
          {/* Search to be added later */}
          {/* <div className="flex flex-col flex-1 justify-start items-start gap-4">
            <InputWithButton />
          </div> */}
        </div>
      </div>
    </>
  );
}
