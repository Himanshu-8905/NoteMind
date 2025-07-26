import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getAllDocuments = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("documents")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const storeDocument = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    summary: v.string(),
    userId: v.string(),
    fileType: v.string(),
    fileId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    //find existing document
    const existingDoc = await ctx.db
      .query("documents")
      .withIndex("by_user_and_title_and_filetype", (q) =>
        q
          .eq("userId", args.userId)
          .eq("title", args.title)
          .eq("fileType", args.fileType)
      )
      .unique();

    // return doc id
    if (existingDoc) {
      return null;
    }

    const docId = await ctx.db.insert("documents", {
      title: args.title,
      description: args.description,
      summary: args.summary,
      userId: args.userId,
      fileType: args.fileType,
      fileId: args.fileId,
      url: args.url,
    });

    return docId;
  },
});

export const getDocument = query({
  args: {
    docId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.docId);

    if (!document) {
      return null;
    }
    return document;
  },
});

export const deleteDocById = mutation({
  args: {
    id: v.id("documents"),
    userId: v.string(),
  },
  async handler(ctx, args) {
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new Error("Document not found!");
    }

    if (document.userId !== args.userId) {
      throw new Error("Not Authorized!");
    }

    await ctx.storage.delete(document.fileId as Id<"_storage">);

    await ctx.db.delete(args.id);

    return true;
  },
});

export const addSummaryToDoc = mutation({
  args: {
    docId: v.id("documents"),
    userId: v.string(),
    bulletPointSummary: v.string(),
  },
  async handler(ctx, args) {
    const doc = await ctx.db.get(args.docId);
    if (!doc || doc.userId !== args.userId) {
      throw new Error("Unauthorized or doc not found");
    }

    await ctx.db.patch(args.docId, {
      bulletPointSummary: args.bulletPointSummary,
    });
  },
});
