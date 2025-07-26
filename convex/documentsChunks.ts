import { v } from "convex/values";

import { action, mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const getChunkById = query({
  args: { id: v.id("documentsChunks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const insertChunk = mutation({
  args: {
    docId: v.id("documents"),
    text: v.string(),
    embedding: v.array(v.float64()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("documentsChunks", {
      docId: args.docId,
      text: args.text,
      embedding: args.embedding,
      userId: args.userId,
    });
  },
});

export const getAllChunks = query({
  args: {
    userId: v.string(),
    docId: v.id("documents"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("documentsChunks")
      .withIndex("by_docId_and_userId", (q) =>
        q.eq("docId", args.docId).eq("userId", args.userId)
      )
      .collect();
  },
});

export const searchChunks = action({
  args: {
    searchQuery: v.array(v.float64()),
    userId: v.string(),
    docId: v.id("documents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("documentsChunks", "by_embedding", {
      vector: args.searchQuery,
      limit: 5,
      filter: (q) =>
        q.or(q.eq("userId", args.userId), q.eq("docId", args.docId)),
    });

    const records: {
      type: "documentsChunks";
      score: number;
      record: Doc<"documentsChunks">;
    }[] = [];

    await Promise.all(
      results.map(async (result) => {
        const chunk = await ctx.runQuery(api.documentsChunks.getChunkById, {
          id: result._id,
        });
        if (!chunk) {
          return;
        }
        records.push({
          record: chunk,
          score: result._score,
          type: "documentsChunks",
        });
      })
    );

    records.sort((a, b) => b.score - a.score);

    return records;
  },
});
