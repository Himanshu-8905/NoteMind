
# 🧠 NoteMind – Your AI-Powered Study Companion

**NoteMind** is an all-in-one intelligent notes platform for students. Upload study materials, summarize them, ask questions, extract insights from YouTube videos or GitHub repositories, and supercharge your learning with AI.

---

## ❓ Problem Statement

In today’s fast-paced academic environment, students often struggle with managing and understanding large volumes of study material from various sources—class notes, online lectures, YouTube videos, and open-source code repositories. Traditional note-taking methods are time-consuming, fragmented, and lack interactivity or personalization.

Students need a centralized, intelligent platform that not only stores their learning resources but also helps them **understand, summarize, and interact** with the content more effectively.

**NoteMind** addresses this challenge by providing an AI-powered environment where students can:

* Upload study materials and generate smart summaries
* Ask specific questions about any part of their content
* Convert YouTube videos into structured notes
* Explore and understand GitHub codebases through natural language
* Generate quiz from notes
---
## ✨ Features

### 📄 Notes Upload & Summarization
- Upload files (PDF, DOCX, TXT)
- Generate concise, bullet-point, or detailed summaries
- Highlight important sections with AI assistance
- Export to PDF
- Quiz generator (from notes) (MCQs or short answers)

### 🤖 AI Q&A
- Ask questions about your uploaded notes
- Select specific lines or text to get targeted answers
- Get detailed answers from Gemini AI

### 🎥 YouTube Video Notes
- Paste a YouTube video link
- Extract transcripts and generate structured notes
- Ask follow up questions and many more.

### 💻 GitHub Repository Q&A
- Add any public or private (access token required) GitHub repository
- Ask questions about code or specific files
- Get summaries of complex functions 

### 🔁 Study Tools (Upcoming features)
- Flashcard generator from notes
- Study planner and progress tracker
- Export to DOCX, or Anki

---

## 🚀 Tech Stack

| Layer        | Technology                               |
|--------------|------------------------------------------|
| Frontend     | Next.js, Shadcn UI, Tailwind CSS         |
| Backend      | Next API                                 |
| AI Services  | Gemini API, LangChain                    |
| File Storage | Convex Cloud Storage                     |
| Vector DB    | Convex                                   |
| Auth         | Clerk                                    |

---

## 🛠 Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/NoteMind.git
cd NoteMind
````

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file:

```env
CONVEX_DEPLOYMENT=convex-deployment 
NEXT_PUBLIC_CONVEX_URL=convex-url

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk-publishable-key
CLERK_SECRET_KEY=clerk-secret-key
ISSUER_URL=clerk-issuer-url

#github
GITHUB_TOKEN=your-github-token

#gemini
GEMINI_API_KEY=your-gemini-api-key

# Youtube api key
YOUTUBE_API_KEY=your-youtube-api-key

NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📦 Folder Structure

```
/components      – Reusable React components
/pages           – Next.js routes
/lib             – Utility functions and API wrappers
/app/api         – Server actions and file processing
/public          – Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR if you have ideas, suggestions, or fixes.

---

## 📄 License

MIT License

---

## 🙌 Acknowledgements

* [GEMINI](https://gemini.google.com)
* [LangChain](https://www.langchain.com)
* [Convex](https://www.convex.dev)
* [YouTube Transcript API](https://developers.google.com/youtube/v3/docs/captions)
* [Magicpattern](https://www.magicpattern.design/)
* [GIPHY](https://giphy.com/)

---

## 📬 Contact

**Made with ❤️ for students everywhere.**

