export default function WelcomeProject() {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-10">
      <div className="bg-white dark:bg-gray-600 rounded-2xl shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 px-6 py-5 max-w-lg w-full">
        <h2 className="text-sm md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ask me anything! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm md:text-xl">
          I can help you with:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-gray-200 text-xs md:text-sm">
          <li className="flex items-end gap-2">
            <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
            <span>Generating a relevant Readme file</span>
          </li>
          <li className="flex items-end gap-2">
            <span className="text-blue-500 dark:text-blue-400  mt-1">•</span>
            <span>Searching through Your Code</span>
          </li>
          <li className="flex items-end gap-2">
            <span className="text-blue-500 dark:text-blue-400  mt-1">•</span>
            <span>Summarize the code file</span>
          </li>
          <li className="flex items-end gap-2">
            <span className="text-blue-500 dark:text-blue-400  mt-1">•</span>
            <span>And many more.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
