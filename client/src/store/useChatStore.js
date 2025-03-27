import { create } from "zustand";
import { persist } from "zustand/middleware";
import { socket } from "../utils/socket.js";

const useChatStore = create(
  persist(
    (set, get) => ({
      userId: localStorage.getItem("id") || null,
      messages: [],
      conversations: [],

      // Set user ID on login
      setUserId: (id) => {
        localStorage.setItem("id", id);
        set({ userId: id });
      },

      // Fetch conversations (including last message)
      fetchConversations: () => {
        const userId = get().userId;
        if (!userId) return;

        socket.emit("getConversation", { userId });
        socket.on("getConversation", (data) => {
          if (Array.isArray(data)) {
            set({ conversations: data });
          } else {
            console.error("Invalid conversations data:", data);
          }
        });
      },

      // Fetch messages for a conversation
      fetchMessages: (conversationId) => {
        const userId = get().userId;
        if (!userId || !conversationId) return;

        socket.emit("messages", { userId, conversationId });
        socket.on("messages", (data) => {
          if (Array.isArray(data)) {
            set({ messages: data.filter((msg) => !msg.isDeleted) });
          } else {
            console.error("Invalid messages data:", data);
          }
        });
      },

      // Send message
      sendMessage: (conversationId, text) => {
        const userId = get().userId;
        if (!userId || !text.trim()) return;

        const messageData = { conversationId, sender: userId, text: text.trim() };
        socket.emit("message", JSON.stringify(messageData));

        // Optimistically update UI
        set((state) => ({
          messages: [...state.messages, messageData],
          conversations: state.conversations.map((conv) =>
            conv._id === conversationId ? { ...conv, lastMessage: messageData.text } : conv
          ),
        }));
      },

      // Handle incoming messages
      handleIncomingMessage: (message) => {
        set((state) => {
          if (message.conversationId === state.selectedConversation) {
            return { messages: [...state.messages, message] };
          }

          // Update last message in conversation list
          return {
            conversations: state.conversations.map((conv) =>
              conv._id === message.conversationId ? { ...conv, lastMessage: message.text } : conv
            ),
          };
        });
      },
    }),
    { name: "chat-storage" }
  )
);

// Listen for new messages
socket.on("message", (message) => {
  useChatStore.getState().handleIncomingMessage(message);
});

export default useChatStore;
