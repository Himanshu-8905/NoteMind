"use client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Sparkles,
  UploadCloudIcon,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";

import Link from "next/link";

const features = [
  {
    title: "Summarize Any YouTube Video",
    image: "video.png",
  },
  {
    title: "Understand and Ask About Your Notes",
    image: "document.png",
  },
  {
    title: "Explore GitHub Repos with AI Explanations",
    image: "repo.png",
  },
];

const steps = [
  {
    title: "1. Upload Your Study Material",
    description:
      "Add your notes, YouTube video links, or GitHub repositories to get started.",
    icon: UploadCloudIcon, // Replace with your actual icon component
  },
  {
    title: "2. Unlock AI-Powered Understanding",
    description:
      "Our AI summarizes content, explains key concepts, and answers questions in real-time.",
    icon: Brain, // Replace with your actual icon component
  },
  {
    title: "3. Study Smarter, Not Harder",
    description:
      "Generate flashcards, quizzes, and structured notes to reinforce learning and retain more.",
    icon: BookOpenCheck, // Replace with your actual icon component
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="py-24 w-full magicpattern">
        <div className="mx-auto pt-4">
          <div className="flex flex-col items-center gap-10 text-center mb-12">
            <div className="flex gap-3 justify-center items-center py-1 bg-purple-200/50 dark:bg-purple-900/60 px-7 rounded-2xl text-purple-800 dark:text-purple-300 border border-purple-500">
              <Sparkles className="w-5 h-5 text-purple-800 dark:text-purple-300 animate-pulse duration-[1.2s]" />{" "}
              All-in-One AI Notes Companion ✨
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 dark:text-gray-400 mb-6 group cursor-default">
              Explore&nbsp;
              <span className="bg-gradient-to-r from-purple-900 dark:from-purple-500 to-purple-400/50 dark:to-purple-200 bg-clip-text text-transparent group-hover:bg-gradient-to-b transition-all duration-300">
                NoteMind
              </span>
            </h1>
            <p className="text-xl text-gray-900 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Upload study materials, summarize key points, ask questions, and
              generate insights from documents, YouTube videos, or GitHub
              repos—all in one place.
            </p>
            <SignedIn>
              <Link
                className="relative inline-flex gap-2 items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 dark:from-blue-950 dark:to-blue-700 rounded-full hover:from-gray-800 hover:to-gray-700 dark:hover:from-blue-900 dark:hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                href={"/dashboard"}
              >
                Get Started <ArrowRight suppressHydrationWarning />
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton
                mode="modal"
                fallbackRedirectUrl={"/"}
                forceRedirectUrl={"/dashboard"}
              >
                <button className="group cursor-pointer relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white dark:text-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-950 dark:to-indigo-700 rounded-full hover:from-gray-800 hover:to-gray-700 dark:hover:from-indigo-900 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5 dark:text-gray-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 dark:from-gray-700/30 dark:to-gray-600/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900/95">
        <div className="mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Features Specially designed for Students
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* feature cards */}
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-tl from-blue-200 dark:from-indigo-700 via-gray-200 dark:via-gray-800 to-indigo-500 dark:to-indigo-950 group p-6 py-10 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-indigo-500   dark:hover:border-indigo-300 hover:bg-gradient-to-l transition-all duration-1000 flex flex-col h-[420px] relative overflow-hidden"
              >
                <Link href={"/analysis"}>
                  <Image
                    src={`/images/${feature.image}`}
                    width={360}
                    height={270}
                    alt={`${feature.title}`}
                    className="object-contain rounded-lg opacity-90 shadow-indigo-900 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
                  />
                </Link>
                <h3 className="text-xl text-black dark:text-white font-semibold mt-4">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How it works section */}
      <section className="py-20 px-4 md:px-0 bg-gray-50 dark:bg-gray-800/95">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Meet your AI Agent in 3 Simple Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md hover:shadow-lg dark:shadow-gray-900 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className={`w-8 h-8 text-white`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>

                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer section */}
      <footer className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-900 dark:to-indigo-500">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Supercharge Your Studies?
          </h2>
          <p className="text-xl text-indigo-50">
            Join students using AI to learn faster, deeper, and smarter.
          </p>

          <SignedIn>
            <Button suppressHydrationWarning className="cursor-pointer my-5">
              <Link href="/dashboard">Start Learning</Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl={"/"}
              forceRedirectUrl={"/dashboard"}
            >
              <Button className="cursor-pointer my-5">Start Learning</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </footer>
    </div>
  );
}
