import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  project: defineTable({
    userId: v.string(),
    name: v.string(),
    branch: v.string(),
    githubUrl: v.string(),
    githubToken: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_githubUrl_and_user_id_and_branch", [
      "githubUrl",
      "userId",
      "branch",
    ]),
  sourceCodeEmbedding: defineTable({
    userId: v.string(),
    projectId: v.id("project"),
    sourceCode: v.string(),
    fileName: v.string(),
    bulletPointSummary: v.optional(v.string()),
    summaryEmbedding: v.optional(v.array(v.float64())),
  })
    .index("by_user_id", ["userId"])
    .index("by_project_id", ["projectId"])
    .index("by_user_and_project", ["userId", "projectId"])
    .vectorIndex("by_summaryEmbedding", {
      vectorField: "summaryEmbedding",
      dimensions: 768,
      filterFields: ["userId", "projectId"],
    }),
  documents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    summary: v.string(),
    bulletPointSummary: v.optional(v.string()),
    userId: v.string(),
    fileType: v.string(),
    fileId: v.string(),
    url: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_title_and_filetype", ["userId", "title", "fileType"]),
  documentsChunks: defineTable({
    docId: v.id("documents"),
    text: v.string(), // The text of the chunk
    embedding: v.array(v.float64()), // 768-dimensional embedding
    userId: v.string(), // Owner of the document
  })
    .index("by_docId", ["docId"])
    .index("by_docId_and_userId", ["docId", "userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId", "docId"],
    }),

  messages: defineTable({
    userId: v.string(),
    recordId: v.union(v.id("project"), v.id("documents"), v.id("video")),
    text: v.string(),
    isAProject: v.boolean(),
    isHuman: v.boolean(),
    fileRefferences: v.optional(
      v.array(
        v.object({
          type: v.string(),
          score: v.number(),
          record: v.object({
            userId: v.string(),
            projectId: v.id("project"),
            sourceCode: v.string(),
            fileName: v.string(),
            bulletPointSummary: v.optional(v.string()),
            summaryEmbedding: v.optional(v.array(v.float64())),
          }),
        })
      )
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_record", ["userId", "recordId"]),

  note: defineTable({
    userId: v.string(),
    title: v.string(),
    link: v.optional(v.string()),
    description: v.string(),
    recordTitle: v.string(),
    recordId: v.union(v.id("project"), v.id("documents"), v.id("video")),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_recordId", ["userId", "recordId"]),
  video: defineTable({
    userId: v.string(),
    videoId: v.string(),
    title: v.string(),
    url: v.string(),
    description: v.string(),
    thumbnail: v.string(),
    transcript: v.optional(
      v.array(
        v.object({
          text: v.string(),
          timestamp: v.string(),
        })
      )
    ),
    summary: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_user_and_video", ["userId", "videoId"]),
});
