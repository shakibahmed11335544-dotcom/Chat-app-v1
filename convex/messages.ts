import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    hostId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    replyTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is in the host
    const host = await ctx.db
      .query("hosts")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .unique();

    if (!host || !host.participants.includes(userId)) {
      throw new Error("Not authorized to send messages to this host");
    }

    return await ctx.db.insert("messages", {
      hostId: args.hostId,
      senderId: userId,
      content: args.content,
      type: args.type,
      replyTo: args.replyTo,
    });
  },
});

export const getMessages = query({
  args: {
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user is in the host
    const host = await ctx.db
      .query("hosts")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .unique();

    if (!host || !host.participants.includes(userId)) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const replyToMessage = message.replyTo ? await ctx.db.get(message.replyTo) : null;
        
        return {
          ...message,
          sender: sender ? { id: sender._id, name: sender.name || sender.email || "Unknown" } : null,
          replyTo: replyToMessage,
        };
      })
    );
  },
});
