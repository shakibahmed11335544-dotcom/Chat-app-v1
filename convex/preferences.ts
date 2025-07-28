import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    return preferences || {
      darkMode: true, // Default to dark mode
      notifications: true,
    };
  },
});

export const updatePreferences = mutation({
  args: {
    darkMode: v.optional(v.boolean()),
    notifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.darkMode !== undefined && { darkMode: args.darkMode }),
        ...(args.notifications !== undefined && { notifications: args.notifications }),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        darkMode: args.darkMode ?? true,
        notifications: args.notifications ?? true,
      });
    }
  },
});
