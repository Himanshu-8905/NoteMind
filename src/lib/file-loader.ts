import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";

export async function fetchAndExtractPdfText(pdfUrl: string) {
  const response = await fetch(pdfUrl);
  const blob = await response.blob();

  const arrayBuffer = await blob.arrayBuffer();

  const loader = new PDFLoader(new Blob([arrayBuffer]));

  const docs = await loader.load();

  return docs.map((doc) => doc.pageContent).join("\n");
}

export async function fetchAndExtractDocumentText(fileUrl: string) {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const text = await blob.text();

  return text;
}

export async function fetchAndExtractDocxFileText(fileUrl: string) {
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();

  const result = await mammoth.extractRawText({
    buffer: Buffer.from(arrayBuffer),
  });

  return result.value;
}

export async function fetchAndExtractXlsxFileText(fileUrl: string) {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  let text = "";
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_csv(sheet); // or use sheet_to_json
    text += `Sheet: ${sheetName}\n${data}\n`;
  });

  return text;
}
