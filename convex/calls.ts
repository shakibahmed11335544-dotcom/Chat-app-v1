import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startCall = mutation({
  args: {
    hostId: v.string(),
    type: v.union(v.literal("audio"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const host = await ctx.db
      .query("hosts")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .unique();

    if (!host || !host.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("calls", {
      hostId: args.hostId,
      callerId: userId,
      participants: [userId],
      type: args.type,
      status: "ringing",
      startedAt: Date.now(),
    });
  },
});

export const joinCall = mutation({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");

    if (!call.participants.includes(userId)) {
      await ctx.db.patch(args.callId, {
        participants: [...call.participants, userId],
        status: "active",
      });
    }

    return call;
  },
});

export const endCall = mutation({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.callId, {
      status: "ended",
      endedAt: Date.now(),
    });
  },
});

export const getActiveCall = query({
  args: {
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const call = await ctx.db
      .query("calls")
      .withIndex("by_host_id", (q) => q.eq("hostId", args.hostId))
      .filter((q) => q.or(q.eq(q.field("status"), "ringing"), q.eq(q.field("status"), "active")))
      .first();

    if (!call) return null;

    const caller = await ctx.db.get(call.callerId);
    const participants = await Promise.all(
      call.participants.map(async (participantId) => {
        const user = await ctx.db.get(participantId);
        return user ? { id: user._id, name: user.name || user.email || "Unknown" } : null;
      })
    );

    return {
      ...call,
      caller: caller ? { id: caller._id, name: caller.name || caller.email || "Unknown" } : null,
      participants: participants.filter(Boolean),
    };
  },
});
