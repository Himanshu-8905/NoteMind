import { v } from "convex/values";

import { action, mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const getCodeEmbeddingById = query({
  args: { id: v.id("sourceCodeEmbedding") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const saveCodeEmbedding = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("project"),
    sourceCode: v.string(),
    fileName: v.string(),
    bulletPointSummary: v.optional(v.string()),
    summaryEmbedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    //create new source code embedding
    const codeEmbeddingId =
      args.bulletPointSummary !== undefined
        ? await ctx.db.insert("sourceCodeEmbedding", {
            userId: args.userId,
            projectId: args.projectId,
            sourceCode: args.sourceCode,
            fileName: args.fileName,
            bulletPointSummary: args.bulletPointSummary,
            summaryEmbedding: args.summaryEmbedding,
          })
        : await ctx.db.insert("sourceCodeEmbedding", {
            userId: args.userId,
            projectId: args.projectId,
            sourceCode: args.sourceCode,
            fileName: args.fileName,
          });
    return codeEmbeddingId;
  },
});

export const addEmbedding = mutation({
  args: {
    id: v.id("sourceCodeEmbedding"),
    userId: v.string(),
    bulletPointSummary: v.string(),
    summaryEmbedding: v.optional(v.array(v.float64())),
  },
  async handler(ctx, args) {
    const codeFile = await ctx.db.get(args.id);
    if (!codeFile || codeFile.userId !== args.userId) {
      throw new Error("Unauthorized or code file not found");
    }

    if (args.summaryEmbedding === undefined) {
      await ctx.db.patch(args.id, {
        bulletPointSummary: args.bulletPointSummary,
      });
    } else {
      await ctx.db.patch(args.id, {
        bulletPointSummary: args.bulletPointSummary,
        summaryEmbedding: args.summaryEmbedding,
      });
    }
  },
});

export const getAllCodeFiles = query({
  args: {
    userId: v.string(),
    projectId: v.id("project"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("sourceCodeEmbedding")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", args.userId).eq("projectId", args.projectId)
      )
      .collect();
  },
});

export const getSimilarResults = action({
  args: {
    userId: v.string(),
    projectId: v.id("project"),
    searchQuery: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch(
      "sourceCodeEmbedding",
      "by_summaryEmbedding",
      {
        vector: args.searchQuery,
        limit: 3,
        filter: (q) =>
          q.or(q.eq("userId", args.userId), q.eq("projectId", args.projectId)),
      }
    );
    // 3. Fetch the results
    const records: {
      type: "sourceCodeEmbedding";
      score: number;
      record: Doc<"sourceCodeEmbedding">;
    }[] = [];

    await Promise.all(
      results.map(async (result) => {
        const sourceCodeEmbedding = await ctx.runQuery(
          api.sourceCodeEmbedding.getCodeEmbeddingById,
          {
            id: result._id,
          }
        );
        if (!sourceCodeEmbedding) {
          return;
        }
        records.push({
          record: sourceCodeEmbedding,
          score: result._score,
          type: "sourceCodeEmbedding",
        });
      })
    );

    records.sort((a, b) => b.score - a.score);

    return records;
  },
});
