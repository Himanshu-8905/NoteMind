import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllVideos = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("video")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const addVideo = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    videoId: v.string(),
    userId: v.string(),
    thumbnail: v.string(),
    url: v.string(),
    transcript: v.optional(
      v.array(
        v.object({
          text: v.string(),
          timestamp: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    //find existing video
    const existingVideo = await ctx.db
      .query("video")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();

    // return note id
    if (existingVideo) {
      return null;
    }

    const videoRecordId =
      args.transcript !== undefined
        ? await ctx.db.insert("video", {
            userId: args.userId,
            videoId: args.videoId,
            description: args.description,
            thumbnail: args.thumbnail,
            title: args.title,
            url: args.url,
            transcript: args.transcript,
          })
        : await ctx.db.insert("video", {
            userId: args.userId,
            videoId: args.videoId,
            description: args.description,
            thumbnail: args.thumbnail,
            title: args.title,
            url: args.url,
          });

    return videoRecordId;
  },
});

// convex/note.ts
export const updateVideoById = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    transcript: v.optional(
      v.array(
        v.object({
          text: v.string(),
          timestamp: v.string(),
        })
      )
    ),
    summary: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const video = await ctx.db
      .query("video")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();
    if (!video) {
      throw new Error("Video not found");
    }
    if (args.transcript !== undefined) {
      await ctx.db.patch(video._id, {
        transcript: args.transcript,
      });
    }

    if (args.summary !== undefined) {
      await ctx.db.patch(video._id, {
        summary: args.summary,
      });
    }
  },
});

export const getVideoById = query({
  args: {
    videoRecordId: v.id("video"),
  },
  async handler(ctx, args) {
    const video = await ctx.db.get(args.videoRecordId);

    if (!video) {
      return null;
    }

    return video;
  },
});

export const getVideobyUserAndVideoId = query({
  args: {
    userId: v.string(),
    videoId: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("video")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .unique();
  },
});

export const deleteVideoById = mutation({
  args: {
    id: v.id("video"),
    userId: v.string(),
  },
  async handler(ctx, args) {
    const video = await ctx.db.get(args.id);
    if (!video) {
      throw new Error("video not found!");
    }

    if (video.userId !== args.userId) {
      throw new Error("Not Authorized!");
    }
    await ctx.db.delete(args.id);

    return true;
  },
});
