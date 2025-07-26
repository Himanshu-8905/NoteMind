"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

export async function generateQuizFromNote(description: string) {
  const quizGenerativeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction: `You are a quiz generator that creates engaging, concept-checking multiple-choice questions from text.`,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  });

  try {
    const prompt = `
      You are a strict JSON generator.
  
      ONLY return a valid JSON array (no markdown, no explanation, no comments). Return 5 multiple-choice quiz questions from the following note.
  
      Each object must have:
      - "question": string
      - "options": array of 4 strings
      - "answer": the correct option (must match one of the options)
  
      Example:
      [
        {
          "question": "What is React?",
          "options": ["A JS framework", "A CSS library", "A DBMS", "A text editor"],
          "answer": "A JS framework"
        },
        ...
      ]
  
      Now generate based on this note:
      ${description}
      `;
    const result = await quizGenerativeModel.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/```(?:json)?/, "")
        .replace(/```$/, "")
        .trim();
    }

    return rawText;
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded : ", error);
      // throw new Error("Rate Limit exceeded");
    }

    console.error("Gemini quiz generator error : ", error);
    return " ";
  }
}
