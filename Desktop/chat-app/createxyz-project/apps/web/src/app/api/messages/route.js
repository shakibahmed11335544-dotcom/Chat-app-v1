import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");
    let userId = url.searchParams.get("userId");

    // Use authenticated user if available
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (!userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!chatId) {
      return Response.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Verify user is a member of the chat
    const [membership] = await sql`
      SELECT id FROM chat_members 
      WHERE chat_id = ${chatId} AND user_id = ${userId}
    `;

    if (!membership) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Get messages with sender information
    const messages = await sql`
      SELECT 
        m.id,
        m.chat_id,
        m.user_id,
        m.content,
        m.message_type,
        m.file_url,
        m.read_status,
        m.created_at,
        u.name as sender_name,
        u.avatar_url as sender_avatar,
        CASE WHEN m.user_id = ${userId} THEN true ELSE false END as is_sent_by_me
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.chat_id = ${chatId}
      ORDER BY m.created_at ASC
    `;

    // Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.chat_id,
      userId: msg.user_id,
      content: msg.content,
      messageType: msg.message_type,
      fileUrl: msg.file_url,
      readStatus: msg.read_status,
      timestamp: msg.created_at,
      senderName: msg.sender_name,
      senderAvatar:
        msg.sender_avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=8b5cf6&color=fff`,
      isSentByMe: msg.is_sent_by_me,
    }));

    return Response.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    const {
      chatId,
      userId: providedUserId,
      content,
      messageType = "text",
      fileUrl,
    } = await request.json();

    // Use authenticated user if available
    let userId = session?.user?.id || providedUserId;

    if (!userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!chatId || !content) {
      return Response.json(
        { error: "Chat ID and content are required" },
        { status: 400 },
      );
    }

    // Ensure user exists in database
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

    // Verify user is a member of the chat
    const [membership] = await sql`
      SELECT id FROM chat_members 
      WHERE chat_id = ${chatId} AND user_id = ${userId}
    `;

    if (!membership) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Insert the message
    const [newMessage] = await sql`
      INSERT INTO messages (chat_id, user_id, content, message_type, file_url, read_status, created_at)
      VALUES (${chatId}, ${userId}, ${content}, ${messageType}, ${fileUrl || null}, 'sent', CURRENT_TIMESTAMP)
      RETURNING id, chat_id, user_id, content, message_type, file_url, read_status, created_at
    `;

    // Update chat's updated_at timestamp
    await sql`
      UPDATE chats 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${chatId}
    `;

    // Get sender information for the response
    const [sender] = await sql`
      SELECT name, avatar_url FROM users WHERE id = ${userId}
    `;

    const formattedMessage = {
      id: newMessage.id,
      chatId: newMessage.chat_id,
      userId: newMessage.user_id,
      content: newMessage.content,
      messageType: newMessage.message_type,
      fileUrl: newMessage.file_url,
      readStatus: newMessage.read_status,
      timestamp: newMessage.created_at,
      senderName: sender?.name || "Unknown User",
      senderAvatar:
        sender?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.name || "User")}&background=8b5cf6&color=fff`,
      isSentByMe: true,
    };

    return Response.json(formattedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return Response.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }
}
