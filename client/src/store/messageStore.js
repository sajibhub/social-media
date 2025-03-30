// messageStore.js
import { create } from 'zustand';
import { socket } from '../utils/socket.js';

const useMessageStore = create((set, get) => ({
    messages: [],
    inputText: '',
    conversations: [],
    currentUserInfo: null,
    searchQuery: '',
    activeUsers: [],
    contextMenu: null,
    editModal: null,
    editText: '',
    deleteModal: null,
    replayId: null,
    replayMessage: null,
    socketInitialized: false,

    // Actions
    setInputText: (text) => set({ inputText: text }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setContextMenu: (menu) => set({ contextMenu: menu }),
    setEditModal: (modal) => set({ editModal: modal }),
    setEditText: (text) => set({ editText: text }),
    setDeleteModal: (modal) => set({ deleteModal: modal }),
    setReplay: (id, message) => set({ replayId: id, replayMessage: message }),
    clearReplay: () => set({ replayId: null, replayMessage: null }),

    // Socket Initialization and Cleanup
    initializeSocket: (currentUserId) => {
        if (!currentUserId || get().socketInitialized) return;

        if (!socket.connected) {
            socket.connect();
            set({ socketInitialized: true });
            socket.emit('join', currentUserId);
        }

        socket.on('active', (users) => set({ activeUsers: users }));
    },

    cleanupSocket: () => {
        socket.off('active');
        if (socket.connected) {
            socket.disconnect();
            set({ socketInitialized: false });
        }
    },

    // Conversations Logic
    fetchConversations: (currentUserId) => {
        if (!currentUserId) return;

        socket.emit('getConversation', { userId: currentUserId });

        socket.on('getConversation', (data) => {
            if (!Array.isArray(data)) return;
            set({ conversations: data });
            const { conversationId } = get();
            if (conversationId) {
                const currentConv = data.find((conv) => conv._id === conversationId);
                if (currentConv && currentConv.participant) {
                    set({
                        currentUserInfo: {
                            ...currentConv.participant,
                            isActive: get().activeUsers.includes(currentConv.participant._id?.toString() || ''),
                            lastActive: currentConv.participant.lastActive,
                        },
                    });
                } else {
                    set({ currentUserInfo: null });
                }
            }
        });

        socket.on('conversationCreated', (newConv) => {
            set((state) => ({
                conversations: [...state.conversations.filter((c) => c._id !== newConv._id), newConv],
            }));
        });

        socket.on('updateConversation', (updatedConversation) => {
            set((state) => {
                const updatedList = state.conversations.map((chat) =>
                    chat._id === updatedConversation._id ? { ...chat, ...updatedConversation } : chat
                );
                return {
                    conversations: updatedList.sort(
                        (a, b) =>
                            new Date(b.lastMessage?.timestamp || b.updatedAt) -
                            new Date(a.lastMessage?.timestamp || a.updatedAt)
                    ),
                };
            });
            const { conversationId } = get();
            if (updatedConversation._id === conversationId && updatedConversation.participant) {
                set({
                    currentUserInfo: {
                        ...updatedConversation.participant,
                        isActive: get().activeUsers.includes(updatedConversation.participant._id?.toString() || ''),
                        lastActive: updatedConversation.participant.lastActive,
                    },
                });
            }
        });

        socket.on('unseen', ({ unseen, conversationId: updatedConversationId }) => {
            set((state) => {
                const updatedList = state.conversations.map((chat) =>
                    chat._id === updatedConversationId ? { ...chat, unseen } : chat
                );
                return {
                    conversations: updatedList.sort(
                        (a, b) =>
                            new Date(b.lastMessage?.timestamp || b.updatedAt) -
                            new Date(a.lastMessage?.timestamp || a.updatedAt)
                    ),
                };
            });
        });
    },

    // Messages Logic
    fetchMessages: (currentUserId, conversationId) => {
        if (!conversationId) {
            set({ messages: [] });
            return;
        }

        socket.emit('messages', { userId: currentUserId, conversationId });

        socket.on('messages', (data) => {
            if (!Array.isArray(data)) return;
            set({ messages: data });
            const unreadMessageIds = data
                .filter((msg) => !msg.seen && msg.sender !== currentUserId && !msg.isDeleted)
                .map((msg) => msg._id);
            if (unreadMessageIds.length > 0) {
                socket.emit('seen', { conversationId, messageId: unreadMessageIds, senderId: currentUserId });
            }
        });

        socket.on('message', (message) => {
            if (message.conversationId === conversationId) {
                set((state) => ({ messages: [...state.messages, message] }));
                if (message.sender !== currentUserId && !message.seen && !message.isDeleted) {
                    socket.emit('seen', { conversationId, messageId: [message._id], senderId: currentUserId });
                }
            }
        });

        socket.on('seen', (messageIds) => {
            const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
            set((state) => ({
                messages: state.messages.map((msg) => (ids.includes(msg._id) ? { ...msg, seen: true } : msg)),
            }));
        });

        socket.on('messageEdited', (updatedMessage) => {
            if (updatedMessage.conversationId === conversationId) {
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg._id === updatedMessage._id ? { ...updatedMessage } : msg
                    ),
                }));
            }
        });

        socket.on('messageDeleted', ({ messageId, isDeleted }) => {
            set((state) => ({
                messages: state.messages.map((msg) => (msg._id === messageId ? { ...msg, isDeleted } : msg)),
            }));
        });
    },

    cleanupMessages: () => {
        socket.off('messages');
        socket.off('message');
        socket.off('seen');
        socket.off('messageEdited');
        socket.off('messageDeleted');
    },

    sendMessage: (currentUserId, conversationId) => {
        const { inputText, replayId, replayMessage } = get();
        if (!inputText.trim() || !conversationId || !currentUserId) return;
        const messageData = {
            conversationId,
            sender: currentUserId,
            text: inputText.trim(),
            replyTo: replayId ? { id: replayId, message: replayMessage } : null,
        };
        socket.emit('message', JSON.stringify(messageData));
        set({ inputText: '', replayId: null, replayMessage: null });
    },

    editMessage: (messageId, currentUserId, newText) => {
        if (newText && newText.trim()) {
            socket.emit('editMessage', { messageId, senderId: currentUserId, newText: newText.trim() });
        }
        set({ editModal: null, editText: '' });
    },

    deleteMessage: (messageId, currentUserId) => {
        socket.emit('deleteMessage', { messageId, senderId: currentUserId });
        set({ deleteModal: null });
    },
}));

export default useMessageStore;