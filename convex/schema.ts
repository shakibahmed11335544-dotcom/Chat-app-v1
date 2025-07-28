import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  hosts: defineTable({
    name: v.string(),
    hostId: v.string(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    participants: v.array(v.id("users")),
  }).index("by_host_id", ["hostId"]),

  messages: defineTable({
    hostId: v.string(),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    replyTo: v.optional(v.id("messages")),
  }).index("by_host_id", ["hostId"]),

  calls: defineTable({
    hostId: v.string(),
    callerId: v.id("users"),
    participants: v.array(v.id("users")),
    type: v.union(v.literal("audio"), v.literal("video")),
    status: v.union(v.literal("ringing"), v.literal("active"), v.literal("ended")),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  }).index("by_host_id", ["hostId"]),

  userPreferences: defineTable({
    userId: v.id("users"),
    darkMode: v.boolean(),
    notifications: v.boolean(),
  }).index("by_user_id", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
