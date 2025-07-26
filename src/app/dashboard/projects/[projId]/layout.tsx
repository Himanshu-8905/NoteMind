"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EyeIcon } from "lucide-react";

export default function ProjectLayout({
  children,
  file,
  folders,
  summary,
}: {
  children: React.ReactNode;
  file: React.ReactNode;
  folders: React.ReactNode;
  summary: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section
      className="w-full sm:flex sm:flex-wrap sm:justify-between sm:items-start md:grid md:grid-cols-6 gap-1.5"
    >
      <main className="sm:flex-1 md:col-span-1">{folders}</main>
      <main
        className={`sm:flex-1 md:col-span-3 ${open ? "visible" : "hidden"}`}
      >
        {file}
      </main>
      <main
        className={`sm:flex-1 ${open ? "md:col-span-2" : "md:col-span-5"} flex flex-col gap-0.5 justify-start items-start`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger onClick={() => setOpen(!open)}>
              <EyeIcon className="cursor-pointer w-5 h-5" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{open ? "Hide File" : "Show File"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Tabs defaultValue="document" className={`w-full`}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document">File Summary</TabsTrigger>
            <TabsTrigger value="chatDoc">Ask AI</TabsTrigger>
          </TabsList>
          <TabsContent value="document">{summary}</TabsContent>
          <TabsContent value="chatDoc">{children}</TabsContent>
        </Tabs>
      </main>
    </section>
  );
}
