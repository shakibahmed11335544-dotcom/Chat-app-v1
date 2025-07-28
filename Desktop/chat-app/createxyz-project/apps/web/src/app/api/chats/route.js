import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    let userId = url.searchParams.get("userId");

    // Use authenticated user if available, otherwise fall back to URL param for demo
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (!userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Ensure user exists in database
    const [existingUser] = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

    if (!existingUser && session?.user) {
      // Create user if they don't exist but are authenticated
      await sql`
        INSERT INTO users (id, name, email, avatar_url, status, last_seen, created_at)
        VALUES (${session.user.id}, ${session.user.name}, ${session.user.email}, ${session.user.image || null}, 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
          last_seen = CURRENT_TIMESTAMP
      `;
    }

    // Get all chats for the user with latest message info
    const chats = await sql`
      SELECT 
        c.id,
        c.name,
        c.type,
        u.name as contact_name,
        u.avatar_url as contact_avatar,
        u.status as contact_status,
        (
          SELECT content 
          FROM messages 
          WHERE chat_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE chat_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE chat_id = c.id 
          AND user_id != ${userId}
          AND read_status != 'read'
        ) as unread_count,
        c.updated_at
      FROM chats c
      JOIN chat_members cm ON c.id = cm.chat_id
      LEFT JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id != ${userId}
      LEFT JOIN users u ON cm2.user_id = u.id
      WHERE cm.user_id = ${userId}
      ORDER BY 
        CASE 
          WHEN (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) IS NOT NULL 
          THEN (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1)
          ELSE c.created_at
        END DESC
    `;

    // Format the response
    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      name:
        chat.type === "group" ? chat.name : chat.contact_name || "Unknown User",
      avatar:
        chat.contact_avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.contact_name || chat.name || "User")}&background=8b5cf6&color=fff`,
      lastMessage: chat.last_message || "No messages yet",
      lastMessageTime: chat.last_message_time,
      unreadCount: parseInt(chat.unread_count) || 0,
      isOnline: chat.contact_status === "online",
      type: chat.type,
    }));

    return Response.json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return Response.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    const { name, type = "individual", participants } = await request.json();

    // Use authenticated user if available
    let currentUserId = session?.user?.id;
    if (!currentUserId && participants && participants.length > 0) {
      currentUserId = participants[0]; // Fallback for demo
    }

    if (!currentUserId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Ensure current user exists in database
    if (session?.user) {
      await sql`
        INSERT INTO users (id, name, email, avatar_url, status, last_seen, created_at)
        VALUES (${session.user.id}, ${session.user.name}, ${session.user.email}, ${session.user.image || null}, 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
          last_seen = CURRENT_TIMESTAMP
      `;
    }

    // For individual chats, check if chat already exists between users
    if (type === "individual" && participants && participants.length === 2) {
      const [user1, user2] = participants;

      const [existingChat] = await sql`
        SELECT c.id, c.name, c.type
        FROM chats c
        JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = ${user1}
        JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = ${user2}
        WHERE c.type = 'individual'
        LIMIT 1
      `;

      if (existingChat) {
        return Response.json(existingChat);
      }
    }

    // Create new chat
    const [newChat] = await sql`
      INSERT INTO chats (name, type)
      VALUES (${name}, ${type})
      RETURNING id, name, type, created_at
    `;

    // Add participants to the chat
    if (participants && participants.length > 0) {
      for (const userId of participants) {
        await sql`
          INSERT INTO chat_members (chat_id, user_id)
          VALUES (${newChat.id}, ${userId})
          ON CONFLICT (chat_id, user_id) DO NOTHING
        `;
      }
    }

    return Response.json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return Response.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
