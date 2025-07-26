import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllNotes = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("note")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const saveNote = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    link: v.optional(v.string()),
    userId: v.string(),
    recordTitle: v.string(),
    recordId: v.union(v.id("project"), v.id("documents"), v.id("video")),
  },
  handler: async (ctx, args) => {
    //find existing Note
    const existingNote = await ctx.db
      .query("note")
      .withIndex("by_user_and_recordId", (q) =>
        q.eq("userId", args.userId).eq("recordId", args.recordId)
      )
      .unique();

    // return note id
    if (existingNote) {
      return existingNote._id;
    }

    const noteId = args.link
      ? await ctx.db.insert("note", {
          title: args.title,
          description: args.description,
          userId: args.userId,
          link: args.link,
          recordTitle: args.recordTitle,
          recordId: args.recordId,
        })
      : await ctx.db.insert("note", {
          title: args.title,
          description: args.description,
          userId: args.userId,
          recordTitle: args.recordTitle,
          recordId: args.recordId,
        });

    return noteId;
  },
});

export const updateNoteById = mutation({
  args: {
    noteId: v.id("note"),
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    link: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== args.userId) {
      throw new Error("Unauthorized or note not found");
    }

    if (args.link !== undefined) {
      await ctx.db.patch(args.noteId, {
        title: args.title,
        description: args.description,
        link: args.link,
      });
    } else {
      await ctx.db.patch(args.noteId, {
        title: args.title,
        description: args.description,
      });
    }
  },
});

export const getNoteById = query({
  args: {
    userId: v.string(),
    noteId: v.id("note"),
  },
  async handler(ctx, args) {
    const note = await ctx.db.get(args.noteId);

    if (!note) {
      return null;
    }
    if (note.userId !== args.userId) {
      throw new Error("Not Authorized!");
    }

    return note;
  },
});

export const getNotebyUserAndRecord = query({
  args: {
    userId: v.string(),
    recordId: v.union(v.id("project"), v.id("documents"), v.id("video")),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("note")
      .withIndex("by_user_and_recordId", (q) =>
        q.eq("userId", args.userId).eq("recordId", args.recordId)
      )
      .unique();
  },
});

export const deleteNoteById = mutation({
  args: {
    id: v.id("note"),
    userId: v.string(),
  },
  async handler(ctx, args) {
    const note = await ctx.db.get(args.id);
    if (!note) {
      throw new Error("Note not found!");
    }

    if (note.userId !== args.userId) {
      throw new Error("Not Authorized!");
    }
    await ctx.db.delete(args.id);

    return true;
  },
});
