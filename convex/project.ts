import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Query to get all projects for a user
export const getAllProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("project")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const getProjectById = query({
  args: {
    id: v.id("project"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createProject = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    githubUrl: v.string(),
    branch: v.string(),
    githubToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    //check existing project
    const existingProject = await ctx.db
      .query("project")
      .withIndex("by_githubUrl_and_user_id_and_branch", (q) =>
        q
          .eq("githubUrl", args.githubUrl)
          .eq("userId", args.userId)
          .eq("branch", args.branch)
      )
      .unique();

    // return that
    if (existingProject) {
      return null;
    }

    const projectId = await ctx.db.insert("project", {
      userId: args.userId,
      name: args.name,
      githubUrl: args.githubUrl,
      branch: args.branch,
      githubToken: args.githubToken,
    });
    return projectId;
  },
});

export const deleteProjectById = mutation({
  args: {
    id: v.id("project"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found!");
    }

    if (project.userId !== args.userId) {
      throw new Error("Not Authorized!");
    }

    await ctx.db.delete(args.id);

    return true;
  },
});
