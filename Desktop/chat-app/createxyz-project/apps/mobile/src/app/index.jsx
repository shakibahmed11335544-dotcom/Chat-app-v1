import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/utils/auth/useAuth";
import { useUser } from "@/utils/auth/useUser";

const { width, height } = Dimensions.get("window");

// API Base URL for development
const API_BASE_URL = "http://localhost:3000";

// Icons as simple text for now (you can replace with icon library)
const icons = {
  search: "🔍",
  add: "+",
  send: "➤",
  phone: "📞",
  video: "📹",
  back: "←",
  menu: "☰",
  logout: "⚡",
  user: "👤",
  more: "⋯",
};

// Add User Modal Component
function AddUserModal({ visible, onClose, onUserAdded }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { data: currentUser } = useUser();

  const searchUsers = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query.trim())}`,
        );
        if (response.ok) {
          const users = await response.json();
          setSearchResults(users.filter((user) => user.id !== currentUser?.id));
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [currentUser?.id],
  );

  const createChatWithUser = async (user) => {
    setIsCreatingChat(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          type: "individual",
          participants: [currentUser.id, user.id],
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        onUserAdded(newChat);
        onClose();
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => createChatWithUser(item)}
      disabled={isCreatingChat}
    >
      <Image
        source={{
          uri:
            item.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=8b5cf6&color=fff`,
        }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} disabled={isCreatingChat}>
        <Text style={styles.addButtonText}>{icons.add}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Contact</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>{icons.search}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.usersList}
            contentContainerStyle={styles.usersListContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>{icons.user}</Text>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? "No users found"
                    : "Search for users to start chatting"}
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Chat Interface Component
function ChatInterface({ chat, onBack, user }) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Fetch messages
  const { data: fetchedMessages = [], isLoading } = useQuery({
    queryKey: ["messages", chat.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(
        `${API_BASE_URL}/api/messages?chatId=${chat.id}&userId=${user.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!chat.id && !!user?.id,
  });

  useEffect(() => {
    if (fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const tempMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      isSentByMe: true,
      timestamp: new Date().toISOString(),
      senderName: user.name,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          userId: user.id,
          content: tempMessage.content,
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? savedMessage : msg)),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSentByMe ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      {!item.isSentByMe && (
        <Text style={styles.senderName}>{item.senderName}</Text>
      )}
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.chatHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{icons.back}</Text>
          </TouchableOpacity>
          <Image
            source={{
              uri:
                chat.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=8b5cf6&color=fff`,
            }}
            style={styles.chatAvatar}
          />
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.chatStatus}>Online</Text>
          </View>
          <View style={styles.chatActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{icons.video}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{icons.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesListContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />
          )}
        </View>

        {/* Message Input */}
        <View
          style={[
            styles.messageInputContainer,
            { paddingBottom: insets.bottom },
          ]}
        >
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: newMessage.trim() ? 1 : 0.5 },
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>{icons.send}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// Main Chat App
export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { signIn, signOut, isAuthenticated, isReady } = useAuth();
  const { data: user, loading: userLoading } = useUser();

  // Fetch chats
  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(
        `${API_BASE_URL}/api/chats?userId=${user.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch chats");
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUserAdded = (newChat) => {
    queryClient.invalidateQueries(["chats"]);
    setSelectedChat({
      id: newChat.id,
      name: newChat.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newChat.name)}&background=8b5cf6&color=fff`,
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => setSelectedChat(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.chatItemAvatar} />
      <View style={styles.chatItemInfo}>
        <Text style={styles.chatItemName}>{item.name}</Text>
        <Text style={styles.chatItemMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.chatItemMeta}>
        <Text style={styles.chatItemTime}>
          {item.lastMessageTime
            ? new Date(item.lastMessageTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Show authentication screen if not ready or not authenticated
  if (!isReady || userLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authScreen}>
        <View style={styles.authContainer}>
          <Text style={styles.appTitle}>GoponKotha</Text>
          <Text style={styles.appSubtitle}>Connect with your friends</Text>
          <TouchableOpacity style={styles.authButton} onPress={signIn}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show chat interface if a chat is selected
  if (selectedChat) {
    return (
      <ChatInterface
        chat={selectedChat}
        onBack={() => setSelectedChat(null)}
        user={user}
      />
    );
  }

  // Show main chat list
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=8b5cf6&color=fff`,
            }}
            style={styles.userAvatar}
          />
          <View>
            <Text style={styles.headerTitle}>GoponKotha</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setAddUserModalVisible(true)}
          >
            <Text style={styles.headerButtonText}>{icons.add}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={signOut}>
            <Text style={styles.headerButtonText}>{icons.logout}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>{icons.search}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Chats List */}
      <View style={styles.chatsContainer}>
        {chatsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.chatsList}
            contentContainerStyle={styles.chatsListContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>No chats yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to start chatting
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Add User Modal */}
      <AddUserModal
        visible={addUserModalVisible}
        onClose={() => setAddUserModalVisible(false)}
        onUserAdded={handleUserAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111b21",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111b21",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  authScreen: {
    flex: 1,
    backgroundColor: "#111b21",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 48,
  },
  authButton: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#202c33",
    borderBottomWidth: 1,
    borderBottomColor: "#313d45",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 18,
    color: "#8b5cf6",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a3942",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
  },
  chatsContainer: {
    flex: 1,
  },
  chatsList: {
    flex: 1,
  },
  chatsListContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#313d45",
  },
  chatItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatItemInfo: {
    flex: 1,
  },
  chatItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  chatItemMessage: {
    fontSize: 14,
    color: "#666",
  },
  chatItemMeta: {
    alignItems: "flex-end",
  },
  chatItemTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#00d4aa",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadCount: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#111b21",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#202c33",
    borderBottomWidth: 1,
    borderBottomColor: "#313d45",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#8b5cf6",
  },
  usersList: {
    flex: 1,
  },
  usersListContent: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#313d45",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#8b5cf6",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Chat interface styles
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#202c33",
    borderBottomWidth: 1,
    borderBottomColor: "#313d45",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: "#8b5cf6",
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  chatStatus: {
    fontSize: 12,
    color: "#00d4aa",
  },
  chatActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 18,
    color: "#8b5cf6",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#0b141a",
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#8b5cf6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#2a3942",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: "#ccc",
    opacity: 0.7,
    textAlign: "right",
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#202c33",
    borderTopWidth: 1,
    borderTopColor: "#313d45",
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#2a3942",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: "#8b5cf6",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
