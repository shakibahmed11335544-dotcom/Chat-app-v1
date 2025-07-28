import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createHost = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const hostId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const id = await ctx.db.insert("hosts", {
      name: args.name,
      hostId,
      createdBy: userId,
      isActive: true,
      participants: [userId],
    });

    return { id, hostId };
  },
});

export const joinHost = mutation({
  args: {
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const host = await ctx.db
      .query("hosts")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .unique();

    if (!host) throw new Error("Host not found");

    if (!host.participants.includes(userId)) {
      await ctx.db.patch(host._id, {
        participants: [...host.participants, userId],
      });
    }

    return host;
  },
});

export const getHost = query({
  args: {
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const host = await ctx.db
      .query("hosts")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .unique();

    if (!host || !host.participants.includes(userId)) return null;

    const participants = await Promise.all(
      host.participants.map(async (participantId) => {
        const user = await ctx.db.get(participantId);
        return user ? { id: user._id, name: user.name || user.email || "Unknown" } : null;
      })
    );

    return {
      ...host,
      participants: participants.filter(Boolean),
    };
  },
});

export const getUserHosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const hosts = await ctx.db.query("hosts").collect();
    return hosts.filter(host => host.participants.includes(userId));
  },
});
