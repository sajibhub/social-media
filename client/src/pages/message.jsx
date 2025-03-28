import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket.js";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosClose } from "react-icons/io";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const currentUserId = localStorage.getItem("id");
  const socketInitialized = useRef(false);
  const [replayId, setReplayId] = useState(null);
  const [replayMessage, setReplayMessage] = useState(null);
  const contextMenuRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) return;
    if (!socket.connected && !socketInitialized.current) {
      socket.connect();
      socketInitialized.current = true;
      socket.emit("join", currentUserId);
    }

    const handleActiveUsers = (users) => setActiveUsers(users);
    socket.on("active", handleActiveUsers);

    return () => {
      socket.off("active", handleActiveUsers);
      if (socket.connected) {
        socket.disconnect();
        socketInitialized.current = false;
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    socket.emit("getConversation", { userId: currentUserId });

    const handleConversations = (data) => {
      if (!Array.isArray(data)) return;
      setConversations(data);
      if (conversationId) {
        const currentConv = data.find((conv) => conv._id === conversationId);
        if (currentConv && currentConv.participant) {
          setCurrentUserInfo({
            ...currentConv.participant,
            isActive: activeUsers.includes(currentConv.participant._id?.toString() || ""),
            lastActive: currentConv.participant.lastActive,
          });
        } else {
          setCurrentUserInfo(null);
        }
      }
    };

    const handleUpdateConversation = (updatedConversation) => {
      setConversations((prev) => {
        const updatedList = prev.map((chat) =>
          chat._id === updatedConversation._id ? { ...chat, ...updatedConversation } : chat
        );
        return updatedList.sort(
          (a, b) =>
            new Date(b.lastMessage?.timestamp || b.updatedAt) -
            new Date(a.lastMessage?.timestamp || a.updatedAt)
        );
      });
      if (updatedConversation._id === conversationId && updatedConversation.participant) {
        setCurrentUserInfo({
          ...updatedConversation.participant,
          isActive: activeUsers.includes(updatedConversation.participant._id?.toString() || ""),
          lastActive: updatedConversation.participant.lastActive,
        });
      }
    };

    const handleUnseen = ({ unseen, conversationId: updatedConversationId }) => {
      setConversations((prev) => {
        const updatedList = prev.map((chat) =>
          chat._id === updatedConversationId ? { ...chat, unseen } : chat
        );
        return updatedList.sort(
          (a, b) =>
            new Date(b.lastMessage?.timestamp || b.updatedAt) -
            new Date(a.lastMessage?.timestamp || a.updatedAt)
        );
      });
    };

    socket.on("getConversation", handleConversations);
    socket.on("conversationCreated", (newConv) => {
      setConversations((prev) => [...prev.filter((c) => c._id !== newConv._id), newConv]);
    });
    socket.on("updateConversation", handleUpdateConversation);
    socket.on("unseen", handleUnseen);

    return () => {
      socket.off("getConversation");
      socket.off("conversationCreated");
      socket.off("updateConversation");
      socket.off("unseen");
    };
  }, [currentUserId, conversationId, activeUsers]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    socket.emit("messages", { userId: currentUserId, conversationId });

    const handleMessages = (data) => {
      if (!Array.isArray(data)) return;
      setMessages(data);
      const unreadMessageIds = data.filter((msg) => !msg.seen && msg.sender !== currentUserId).map((msg) => msg._id);
      if (unreadMessageIds.length > 0) {
        socket.emit("seen", { conversationId, messageId: unreadMessageIds, senderId: currentUserId });
      }
    };

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        if (message.sender !== currentUserId && !message.seen) {
          socket.emit("seen", { conversationId, messageId: [message._id], senderId: currentUserId });
        }
        scrollToBottom();
      }
    };

    const handleMessageEdited = (updatedMessage) => {
      if (updatedMessage.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
        );
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };

    socket.on("messages", handleMessages);
    socket.on("message", handleNewMessage);
    socket.on("seen", (messageIds) => {
      const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
      setMessages((prev) => prev.map((msg) => ids.includes(msg._id) ? { ...msg, seen: true } : msg));
    });
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("messages");
      socket.off("message");
      socket.off("seen");
      socket.off("messageEdited");
      socket.off("messageDeleted");
    };
  }, [conversationId, currentUserId]);

  useEffect(() => scrollToBottom(), [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessage = (messageId) => {
    const messageRef = messageRefs.current[messageId];
    if (messageRef) {
      messageRef.scrollIntoView({ behavior: "smooth", block: "center" });
      messageRef.classList.add("highlight-reply"); // Use a new class for reply-specific effect
      setTimeout(() => messageRef.classList.remove("highlight-reply"), 2000); // Remove after 2 seconds
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid" :
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastActive = (lastActive) => {
    if (!lastActive) return "Last seen: Unknown";
    const now = new Date();
    const diff = (now - new Date(lastActive)) / 1000 / 60;
    if (diff < 1) return "Last seen: Just now";
    if (diff < 60) return `Last seen: ${Math.floor(diff)}m ago`;
    return `Last seen: ${new Date(lastActive).toLocaleTimeString()}`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !conversationId || !currentUserId) return;
    const messageData = {
      conversationId,
      sender: currentUserId,
      text: inputText.trim(),
      replyTo: replayId ? { id: replayId, message: replayMessage } : null,
    };
    socket.emit("message", JSON.stringify(messageData));
    setInputText("");
    setReplayId(null);
    setReplayMessage(null);
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    const menuWidth = 120;
    const menuHeight = 100;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let x = e.pageX;
    let y = e.pageY;

    if (x + menuWidth > windowWidth) x = windowWidth - menuWidth - 10;
    if (x < 0) x = 10;
    if (y + menuHeight > windowHeight) y = windowHeight - menuHeight - 10;
    if (y < 0) y = 10;

    const isOwnMessage = message.sender === currentUserId;
    setContextMenu({
      x,
      y,
      messageId: message._id,
      text: message.text,
      isOwnMessage,
    });
  };

  const handleReplay = (id, text) => {
    setReplayId(id);
    setReplayMessage(text);
    setContextMenu(null);
  };

  const handleEdit = (id, text) => {
    setEditModal({ messageId: id, text });
    setContextMenu(null);
  };

  const handleDelete = (id) => {
    setDeleteModal({ messageId: id });
    setContextMenu(null);
  };

  const handleSaveEdit = (newText) => {
    if (newText && newText.trim() && newText !== editModal.text) {
      socket.emit("editMessage", { messageId: editModal.messageId, senderId: currentUserId, newText: newText.trim() });
    }
    setEditModal(null);
  };

  const handleConfirmDelete = () => {
    socket.emit("deleteMessage", { messageId: deleteModal.messageId, senderId: currentUserId });
    setDeleteModal(null);
  };

  const clearReplay = () => {
    setReplayId(null);
    setReplayMessage(null);
  };

  const closeContextMenu = () => setContextMenu(null);
  const closeEditModal = () => setEditModal(null);
  const closeDeleteModal = () => setDeleteModal(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        closeContextMenu();
      }
      if (editModal && editModalRef.current && !editModalRef.current.contains(e.target)) {
        closeEditModal();
      }
      if (deleteModal && deleteModalRef.current && !deleteModalRef.current.contains(e.target)) {
        closeDeleteModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu, editModal, deleteModal]);

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <div className={`${conversationId ? "hidden sm:flex" : "flex"} w-full sm:w-80 flex-col bg-gray-800 border-r border-gray-700 shadow-lg`}>
        <div className="p-4 border-b border-gray-600">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations
            .filter((chat) => chat.participant?.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((chat) => (
              <div
                key={chat._id}
                className={`p-3 hover:bg-gray-700 cursor-pointer transition-colors ${conversationId === chat._id ? "bg-gray-600" : ""}`}
                onClick={() => navigate(`/message/${chat._id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={chat.participant?.profile || "/default-avatar.png"}
                      alt={chat.participant?.fullName || "User"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${activeUsers.includes(chat.participant?._id.toString()) ? "bg-green-500" : "bg-gray-500"}`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm truncate">{chat.participant?.fullName || "Unknown"}</h3>
                      {chat.unseen > 0 && (
                        <span className="bg-red-500 text-xs font-bold px-2 py-0.5 rounded-full">{chat.unseen}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400 truncate">{chat.lastMessage?.content || "No messages yet"}</p>
                      {/* <span className="text-xs text-gray-400">{formatTime(chat.updatedAt)}</span> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col" onContextMenu={(e) => e.preventDefault()}>
        {conversationId ? (
          <>
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-3 sticky top-0 z-10 shadow-md">
              <button
                className="sm:hidden p-2 hover:bg-gray-700 rounded-full transition-colors"
                onClick={() => navigate("/conversation")}
              >
                <span className="text-xl">←</span>
              </button>
              <div className="relative">
                <img
                  onClick={() => navigate(`/profile/${currentUserInfo?.username}`)}
                  src={currentUserInfo?.profile || "/default-avatar.png"}
                  alt={currentUserInfo?.fullName || "User"}
                  className="w-12 h-12 cursor-pointer rounded-full object-cover border-2 border-gray-600"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${currentUserInfo?.isActive ? "bg-green-500" : "bg-gray-500"}`}></span>
              </div>
              <div>
                <h2 onClick={() => navigate(`/profile/${currentUserInfo?.username}`)}
                  className="font-semibold cursor-pointer text-lg">{currentUserInfo?.fullName || "Unknown"}</h2>
                <p className="text-sm text-gray-400">
                  {currentUserInfo?.isActive ? "Active now" : formatLastActive(currentUserInfo?.lastActive)}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {messages.map((message) => {
                const isOwnMessage = message.sender === currentUserId;
                return (
                  <div
                    key={message._id}
                    ref={(el) => (messageRefs.current[message._id] = el)}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl shadow-sm transition-all ${isOwnMessage
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                        : "bg-gray-700 text-gray-200"
                        }`}
                    >
                      {message.replyTo && (
                        <div
                          className="mb-2 p-2 bg-gray-600/30 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors"
                          onClick={() => scrollToMessage(message.replyTo.id)}
                        >
                          <p className="text-xs text-gray-400 italic">
                            {isOwnMessage ? "You replied to:" : "Replying to:"}
                          </p>
                          <p className="text-sm truncate text-gray-300">{message.replyTo.message}</p>
                        </div>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                        <span>{formatTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <span className={`w-2 h-2 rounded-full ${message.seen ? "bg-green-400" : "bg-gray-400"}`}></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {contextMenu && (
              <div
                ref={contextMenuRef}
                className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 animate-fade-in"
                style={{ top: contextMenu.y, left: contextMenu.x }}
              >
                <ul className="py-2 text-sm">
                  <li
                    className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors duration-150"
                    onClick={() => handleReplay(contextMenu.messageId, contextMenu.text)}
                  >
                    Reply
                  </li>
                  {contextMenu.isOwnMessage && (
                    <>
                      <li
                        className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors duration-150"
                        onClick={() => handleEdit(contextMenu.messageId, contextMenu.text)}
                      >
                        Edit
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors duration-150"
                        onClick={() => handleDelete(contextMenu.messageId)}
                      >
                        Delete
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {editModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30 animate-fade-in">
                <div ref={editModalRef} className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Edit Message</h3>
                    <IoIosClose
                      onClick={closeEditModal}
                      className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
                    />
                  </div>
                  <textarea
                    defaultValue={editModal.text}
                    onChange={(e) => (editModal.text = e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 mb-4 resize-none"
                    rows="3"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(editModal.text)}
                      className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30 animate-fade-in">
                <div ref={deleteModalRef} className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Delete Message</h3>
                    <IoIosClose
                      onClick={closeDeleteModal}
                      className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
                    />
                  </div>
                  <p className="text-sm text-gray-300 mb-4">Are you sure you want to delete this message?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={closeDeleteModal}
                      className="px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-800 border-t border-gray-700 shadow-lg">
              {replayId && (
                <div className="mb-2 p-3 bg-gray-700 rounded-lg flex justify-between items-center shadow-sm">
                  <p className="text-sm text-gray-300 truncate">
                    <span className="text-blue-400">Replying to:</span> {replayMessage}
                  </p>
                  <IoIosClose
                    onClick={clearReplay}
                    className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 shadow-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

const styles = `
  .highlight-original {
    animation: highlightOriginal 2s ease-out;
    border: 2px solid #60A5FA;
    background-color: rgba(96, 165, 250, 0.1);
  }

  .highlight-reply {
    animation: highlightReply 2s ease-out;
    border: 3px solid #10B981; /* Green to indicate reply */
    background-color: rgba(16, 185, 129, 0.1); /* Light green background */
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); /* Glow effect */
  }

  @keyframes highlightOriginal {
    0% { 
      border-color: #60A5FA;
      background-color: rgba(96, 165, 250, 0.3);
      transform: scale(1.02);
    }
    100% { 
      border-color: transparent;
      background-color: transparent;
      transform: scale(1);
    }
  }

  @keyframes highlightReply {
    0% { 
      border-color: #10B981;
      background-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.7);
      transform: scale(1.03);
    }
    50% { 
      border-color: #10B981;
      background-color: rgba(16, 185, 129, 0.2);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
      transform: scale(1.05);
    }
    100% { 
      border-color: transparent;
      background-color: transparent;
      box-shadow: 0 0 0 rgba(16, 185, 129, 0);
      transform: scale(1);
    }
  }

  .shadow-sm {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .shadow-lg {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-in;
  }

  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

export default Message;