"use server";

import { generateDocDescription, summarizeDocument } from "@/lib/gemini";
import {
  fetchAndExtractDocumentText,
  fetchAndExtractDocxFileText,
  fetchAndExtractPdfText,
  fetchAndExtractXlsxFileText,
} from "@/lib/file-loader";

export async function generatePdfSummary(pdfUrl: string) {
  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    // console.log(pdfText);
    if (pdfText == " " || !pdfText) {
      throw new Error("Pdf text not generated!");
    }
    const pdfSummary = await summarizeDocument(pdfText.trim());
    if (pdfSummary == " ") {
      throw new Error("Pdf summary not generated!");
    }
    //  console.log(pdfSummary);
    const pdfDescription = await generateDocDescription(pdfSummary);
    // console.log(pdfDescription);
    if (pdfDescription == " ") {
      throw new Error("Pdf description not generated!");
    }

    return {
      success: true,
      message: "pdf summary generated successfully!",
      data: {
        textContent: pdfText.trim(),
        summary: pdfSummary,
        description: pdfDescription,
      },
    };
  } catch (error) {
    console.error("PDF summary generation error:", error);
    return {
      success: false,
      message: "Error extracting PDF text",
      data: null,
    };
  }
}

export async function generateTextFileSummary(docUrl: string) {
  try {
    const docText = await fetchAndExtractDocumentText(docUrl);
    // console.log(docText);
    if (docText == " " || !docText) {
      throw new Error("Document text not generated!");
    }
    const docSummary = await summarizeDocument(docText.trim());
    if (docSummary == " ") {
      throw new Error("Document summary not generated!");
    }
    //  console.log(docSummary);
    const docDescription = await generateDocDescription(docSummary);
    // console.log(docDescription);
    if (docDescription == " ") {
      throw new Error("Document description not generated!");
    }

    return {
      success: true,
      message: "Document summary generated successfully!",
      data: {
        textContent: docText.trim(),
        summary: docSummary,
        description: docDescription,
      },
    };
  } catch (error) {
    console.error("Document summary generation error:", error);
    return {
      success: false,
      message: "Error extracting text",
      data: null,
    };
  }
}

export async function generateDocxFileSummary(fileUrl: string) {
  try {
    const docText = await fetchAndExtractDocxFileText(fileUrl);
    // console.log(docText);
    if (docText == " " || !docText) {
      throw new Error("Document text not generated!");
    }
    const docSummary = await summarizeDocument(docText.trim());
    if (docSummary == " ") {
      throw new Error("Document summary not generated!");
    }
    //  console.log(docSummary);
    const docDescription = await generateDocDescription(docSummary);
    // console.log(docDescription);
    if (docDescription == " ") {
      throw new Error("Document description not generated!");
    }

    return {
      success: true,
      message: "Document summary generated successfully!",
      data: {
        textContent: docText.trim(),
        summary: docSummary,
        description: docDescription,
      },
    };
  } catch (error) {
    console.error("Document summary generation error:", error);
    return {
      success: false,
      message: "Error extracting text",
      data: null,
    };
  }
}

export async function generateExcelFileSummary(fileUrl: string) {
  try {
    const docText = await fetchAndExtractXlsxFileText(fileUrl);
    // console.log(docText);
    if (docText == " " || !docText) {
      throw new Error("Document text not generated!");
    }
    const docSummary = await summarizeDocument(docText.trim());
    if (docSummary == " ") {
      throw new Error("Document summary not generated!");
    }
    //  console.log(docSummary);
    const docDescription = await generateDocDescription(docSummary);
    // console.log(docDescription);
    if (docDescription == " ") {
      throw new Error("Document description not generated!");
    }

    return {
      success: true,
      message: "Document summary generated successfully!",
      data: {
        textContent: docText.trim(),
        summary: docSummary,
        description: docDescription,
      },
    };
  } catch (error) {
    console.error("Document summary generation error:", error);
    return {
      success: false,
      message: "Error extracting text",
      data: null,
    };
  }
}
