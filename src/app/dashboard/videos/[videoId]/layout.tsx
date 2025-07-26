"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export default function DocLayout({
  children,
  chatVid,
  summary,
}: {
  children: React.ReactNode;
  chatVid: React.ReactNode;
  summary: React.ReactNode;
}) {
  return (
    <section className="w-full flex flex-col lg:flex-row justify-between items-start">
      <section className="flex-1">{children}</section>
      <Tabs defaultValue="document" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="document">Video Summary</TabsTrigger>
          <TabsTrigger value="chatVid">Ask AI</TabsTrigger>
        </TabsList>
        <TabsContent value="document">{summary}</TabsContent>
        <TabsContent value="chatVid">{chatVid}</TabsContent>
      </Tabs>
    </section>
  );
}
