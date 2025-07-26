import MessagesLoading from "./MessagesLoading";

export default function ChatSkeleton() {
  return (
    <div className="flex flex-col p-3 border border-gray-200 shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 shadow-md rounded-md h-screen">
      <div className="block px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-2 justify-start items-start font-semibold text-gray-800 dark:text-gray-300">
          <div className="w-8 h-8 bg-purple-900 bg:text-purple-400 py-3 px-2 rounded-md animate-pulse" />
          <span className="bg-gradient-to-r from-purple-900 dark:from-purple-500 to-purple-400/50 dark:to-purple-200  group-hover:bg-gradient-to-b animate-pulse w-8 h-8  py-2 px-25 rounded-md" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 h-full">
        <div className="space-y-6">
          <MessagesLoading />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-100 dark:border-gray-600 p-4 bg-white dark:bg-gray-700 rounded-md">
        <div className="flex flex-wrap gap-2" suppressHydrationWarning>
          <div className="flex-1 px-4 py-4 rounded-full focus:outline-none dark:bg-gray-800 bg-gray-200 dark:text-gray-200 animate-pulse" />
          <div className="cursor-pointer disabled:cursor-not-allowed bg-gray-500 py-2 px-5 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
