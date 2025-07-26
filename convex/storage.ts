import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// generate the upload url of the file
export const generateuploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

//we 'll store the storageId and url

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
