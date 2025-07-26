export default function MessagesLoading() {
  // Generate random number between 2 and 6
  const numMessages = Math.floor(Math.random() * 5) + 2;

  return (
    <div className="flex-1 max-[550px]:w-[280px] min-md:w-full overflow-y-auto p-4">
      <div className="max-w-full mx-auto space-y-8">
        {[...Array(numMessages)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`w-2/3 rounded-2xl p-4 ${
                i % 2 === 0
                  ? "bg-blue-600/10 rounded-br-none"
                  : "bg-white dark:bg-gray-600 rounded-bl-none border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="space-y-3">
                <div
                  className={`h-4 animate-pulse rounded w-[90%] ${i % 2 === 0 ? "bg-white/40" : "bg-gray-200"}`}
                />
                <div
                  className={`h-4 animate-pulse rounded w-[75%] ${i % 2 === 0 ? "bg-white/40" : "bg-gray-200"}`}
                />
                <div
                  className={`h-4 animate-pulse rounded w-[60%] ${i % 2 === 0 ? "bg-white/40" : "bg-gray-200"}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
