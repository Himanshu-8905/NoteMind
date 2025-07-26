"use server";
import { getConvexClient } from "@/lib/convex";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import {
  generateDocxFileSummary,
  generateExcelFileSummary,
  generatePdfSummary,
  generateTextFileSummary,
} from "@/actions/file-upload-actions";
import { Id } from "../../../../convex/_generated/dataModel";
import { chunkText } from "@/lib/helpers";
import { generateEmbedding } from "@/lib/gemini";

//for uploading to convex cloud
const convexClient = getConvexClient();

async function storeDocumentChunks({
  docId,
  textContent,
  userId,
}: {
  docId: Id<"documents">;
  textContent: string;
  userId: string;
}) {
  const chunks = chunkText(textContent);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);

    await convexClient.mutation(api.documentsChunks.insertChunk, {
      docId,
      text: chunk,
      embedding,
      userId,
    });
  }

  return {
    success: true,
    message: `${chunks.length} chunks stored.`,
  };
}

export async function POST(req: Request): Promise<Response> {
  const user = await currentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const document_file = formData.get("document_file") as File | null;
    const document_title = formData.get("document_title") as string | null;
    const file_type = formData.get("file_type") as string | null;
    let docRecordId;

    if (!document_file || !document_title || !file_type) {
      return NextResponse.json(
        { error: "Missing file or title." },
        { status: 400 }
      );
    }

    const allowedExtensions = [
      "pdf",
      "txt",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "xml",
    ];
    if (!allowedExtensions.includes(file_type)) {
      throw new Error("Unsupported file type!");
    }

    //upload in convex cloud
    //generate a short lived upload url
    const postUrl = await convexClient.mutation(api.storage.generateuploadUrl);
    // POST the file to the URL
    const uploadRes = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": document_file?.type },
      body: document_file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload to Convex storage.");
    }

    //get the storage id of the file
    const { storageId } = await uploadRes.json();

    if (!storageId) {
      throw new Error("Couldn't upload file in db");
    }

    //get the file url from convex cloud
    const fileUrl = await convexClient.query(api.storage.getFileUrl, {
      storageId: storageId,
    });

    if (!fileUrl) {
      throw new Error("Couldn't upload file in db");
    }

    if (file_type === "pdf") {
      const { data } = await generatePdfSummary(fileUrl);

      if (!data || data === null) {
        throw new Error("Couldn't upload file in db");
      }
      //store the file in documents table
      const storedDoc = await convexClient.mutation(
        api.documents.storeDocument,
        {
          title: document_title,
          description: data.description,
          summary: data.summary,
          fileType: file_type,
          fileId: storageId,
          userId: user.id,
          url: fileUrl,
        }
      );

      if (!storedDoc) {
        throw new Error("Couldn't upload file in db");
      }

      const resp = await storeDocumentChunks({
        docId: storedDoc,
        textContent: data.textContent,
        userId: user.id,
      });

      if (!resp.success) {
        throw new Error("Error while text chunk loading");
      }

      console.log(resp.message);
      docRecordId=storedDoc;
    } else if (
      file_type === "txt" ||
      file_type === "csv" ||
      file_type === "xml"
    ) {
      const { data } = await generateTextFileSummary(fileUrl);
      if (!data || data === null) {
        throw new Error("Couldn't upload file in db");
      }
      //store the file in documents table
      const storedDoc = await convexClient.mutation(
        api.documents.storeDocument,
        {
          title: document_title,
          description: data.description,
          summary: data.summary,
          fileType: file_type,
          fileId: storageId,
          userId: user.id,
          url: fileUrl,
        }
      );

      if (!storedDoc) {
        throw new Error("Couldn't upload file in db");
      }

      const resp = await storeDocumentChunks({
        docId: storedDoc,
        textContent: data.textContent,
        userId: user.id,
      });

      if (!resp.success) {
        throw new Error("Error while text chunk loading");
      }

      console.log(resp.message);
      docRecordId = storedDoc;
    } else if (file_type === "xlsx" || file_type === "xls") {
      const { data } = await generateExcelFileSummary(fileUrl);
      if (!data || data === null) {
        throw new Error("Couldn't upload file in db");
      }
      //store the file in documents table
      const storedDoc = await convexClient.mutation(
        api.documents.storeDocument,
        {
          title: document_title,
          description: data.description,
          summary: data.summary,
          fileType: file_type,
          fileId: storageId,
          userId: user.id,
          url: fileUrl,
        }
      );

      if (!storedDoc) {
        throw new Error("Couldn't upload file in db");
      }

      const resp = await storeDocumentChunks({
        docId: storedDoc,
        textContent: data.textContent,
        userId: user.id,
      });

      if (!resp.success) {
        throw new Error("Error while text chunk loading");
      }

      console.log(resp.message);
      docRecordId = storedDoc;
    } else if (file_type === "docx") {
      const { data } = await generateDocxFileSummary(fileUrl);
      // console.log("Data ",data);
      if (!data || data === null) {
        throw new Error("Couldn't upload file in db");
      }
      //store the file in documents table
      const storedDoc = await convexClient.mutation(
        api.documents.storeDocument,
        {
          title: document_title,
          description: data.description,
          summary: data.summary,
          fileType: file_type,
          fileId: storageId,
          userId: user.id,
          url: fileUrl,
        }
      );

      if (!storedDoc) {
        throw new Error("Couldn't upload file in db");
      }

      const resp = await storeDocumentChunks({
        docId: storedDoc,
        textContent: data.textContent,
        userId: user.id,
      });

      if (!resp.success) {
        throw new Error("Error while text chunk loading");
      }

      console.log(resp.message);
      docRecordId = storedDoc;
    }

    // Return a successful response
    return NextResponse.json(
      {
        message: `${document_title} file uploaded!`,
        docRecordId:`${docRecordId}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while file upload : ", error);
    return new Response(JSON.stringify({ error: "Something went wrong!" }), {
      status: 400,
    });
  }
}
