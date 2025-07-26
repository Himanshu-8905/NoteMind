import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

function chunkString(str: string, size: number) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

export async function summarizeCodeInBulletPoints(sourceCode:string,fileName:string) {
  const summarizeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction: `
    You are an expert AI software engineer helping a junior developer understand a code file.

    Your job is to read small code snippets and generate 1–3 concise, beginner-friendly bullet points summarizing what that code does.

    Be precise and avoid repetition. Format output like:
    - Does X
    - Implements Y
    - Returns Z
    `.trim(),
  });

  try {
    const maxChunksPerRequest = 3;
    const chunkSize = 200;

    // Clean the code: remove comments and blank lines
    const code = sourceCode
      .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*[\r\n]/gm, "");

    const codeChunks = chunkString(code.trim().slice(0, 8000), chunkSize);

    const chunkBatches = [];
    for (let i = 0; i < codeChunks.length; i += maxChunksPerRequest) {
      chunkBatches.push(codeChunks.slice(i, i + maxChunksPerRequest));
    }

    const summaries = [];
    for (const batch of chunkBatches) {
      try {
        const prompt = `Summarize the following code from file "${fileName.trim()}" in bullet points:${batch.join("").trim()}`.trim();

        const response = await summarizeModel.generateContent([prompt]);
        summaries.push(response.response.text());
      } catch (err) {
        console.error("Error processing batch:", err);
        continue;
      }
    }

    // Clean up extra line breaks, join all batches
    return summaries
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded:", error);
    }
    return "";
  }
}

export async function summarizeCode(doc: Document) {
  const summarizeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction: `You are an AI software engineer guiding a junior developer trying to explain the given file:{filename}\n\n by the given code snippets : {chunk}\n\n.DON'T DO ANYTHING, ONLY SUMMARIZE the given code snippets WITHIN NO MORE THAN 10 WORDS`,
  });

  try {
    const maxChunksPerRequest = 3; // To stay within API limits
    const chunkSize = 200; // Ensures we don’t exceed input token limits

    //remove comments and blank lines
    const code = doc.pageContent
      .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*[\r\n]/gm, "");
    // Step 1: Break document into smaller chunks
    const codeChunks = chunkString(code.trim().slice(0, 8000), chunkSize);

    // Step 2: Create batch requests (each batch = 5 chunks max)
    const chunkBatches = [];
    for (let i = 0; i < codeChunks.length; i += maxChunksPerRequest) {
      chunkBatches.push(codeChunks.slice(i, i + maxChunksPerRequest));
    }

    // Step 3: Process each batch separately
    const summaries = [];
    for (const batch of chunkBatches) {
      try {
        const prompt = `file name: "${doc.metadata.source.trim()}".code snippets:\n${batch.join("").trim()}`;
        const response = await summarizeModel.generateContent([prompt.trim()]);
        summaries.push(response.response.text());
      } catch (err) {
        console.error("Error processing batch:", err);
        continue; // Skip failed batch, continue with others
      }
    }

    return summaries.join(" ");
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded : ", error);
      // throw new Error("Rate Limit exceeded");
    }
    return " ";
  }
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = model.embedContent(summary.trim());
  const embedding = (await result).embedding;
  // console.log(embedding.values);
  return embedding.values;
}

export async function summarizeDocument(docText: string) {
  const summarizeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction: `You are a document summarizer to generate concise, engaging, easy-to-read summaries of documents.`,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  });

  try {
    const prompt = `Transform this document into ONLY one engaging, easy-to-read summary with contextually relevant emojis and plain text format (DO NOTHING ELSE) :\n\n${docText}`;
    const result = await summarizeModel.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded : ", error);
      // throw new Error("Rate Limit exceeded");
    }

    console.error("Gemini Document Summarizer error : ", error);
    return " ";
  }
}

export async function generateBulletPointSummary(docText: string) {
  const summarizeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction: `You are an AI tutor that summarizes study material into clear bullet points. Each bullet point should be a key concept or idea. Optionally include sub-points or brief explanations to enhance understanding.`,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  });

  try {
    const prompt = `ONLY Summarize the following document into bullet points for student learning.
    Each bullet point should focus on one concept or topic. Add brief descriptions or sub-points where needed to explain the concept clearly.
    Format:
    - Main Point
      - Sub-point or explanation

    Text:\n${docText}`;

    const result = await summarizeModel.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded: ", error);
    }

    console.error("Gemini Bullet Summary error: ", error);
    return " ";
  }
}


export async function generateVideoBulletPointSummary(
  transcriptText: string
) {
  const summarizeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction: `You are an AI tutor. Your job is to summarize educational YouTube videos into bullet points with optional sub-points or explanations, helping students understand the core concepts.`,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  });

  try {
    const prompt = `ONLY Summarize the following YouTube video transcript into bullet points for students.
    Each bullet point should capture a key topic or idea. Include brief descriptions or sub-points where useful for deeper understanding.

    Format:
    - Main Point
      - Explanation or sub-point

    Transcript:\n${transcriptText}`;

    const result = await summarizeModel.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded: ", error);
    }

    console.error("Gemini Video Summary error: ", error);
    return " ";
  }
}



export async function generateDocDescription(summary: string) {
  const descriptionGenrativeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    systemInstruction:
      "You are an assistant that generates concise, plain-text descriptions for documents.",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  });

  try {
    const prompt = `Create ONLY one plain-text description (max 30 words) from the following summary (DO NOTHING ELSE):\n\n${summary}`;
    const result = await descriptionGenrativeModel.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error?.status === 429) {
      console.error("Rate limit exceeded : ", error);
      // throw new Error("Rate Limit exceeded");
    }

    console.error("Gemini Document Description generator error : ", error);
    return " ";
  }
}
