import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getAllMessages = query({
  args: {
    userId: v.string(),
    recordId: v.union(v.id("project"), v.id("documents"),v.id("video")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_user_and_record", (q) =>
        q.eq("userId", args.userId).eq("recordId", args.recordId)
      )
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    userId: v.string(),
    recordId: v.union(v.id("project"), v.id("documents"), v.id("video")),
    isAProject: v.boolean(),
    text: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      userId: args.userId,
      recordId: args.recordId,
      text: args.text,
      isAProject: args.isAProject,
      isHuman: args.isHuman,
      fileRefferences: args.fileRefferences,
    });
  },
});
