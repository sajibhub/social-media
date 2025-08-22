import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket.js";
import { useParams, useNavigate } from "react-router-dom";
import { IoIosClose, IoMdSend, IoIosSunny, IoIosMoon } from "react-icons/io";
import '../../public/css/message.css';

const Message = () => {
  // State declarations
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  // Refs
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

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Toggle theme
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Socket connection
  useEffect(() => {
    if (!currentUserId) return;
    
    if (!socket.connected && !socketInitialized.current) {
      socket.connect();
      socketInitialized.current = true;
      
      socket.on("connect", () => {
        socket.emit("authenticate", { userId: currentUserId });
      });
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

  // Conversations
  useEffect(() => {
    if (!currentUserId) return;
    
    setLoading(true);
    socket.emit("getConversation");
    
    const handleConversations = (data) => {
      if (!Array.isArray(data)) return;
      setConversations(data);
      setLoading(false);
      
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

  // Messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    socket.emit("messages", { conversationId });
    
    const handleMessages = (data) => {
      if (!Array.isArray(data)) return;
      setMessages(data);
      
      const unreadMessageIds = data
        .filter((msg) => !msg.seen && msg.sender !== currentUserId && !msg.isDeleted)
        .map((msg) => msg._id);
        
      if (unreadMessageIds.length > 0) {
        socket.emit("seen", { 
          conversationId, 
          messageId: unreadMessageIds,
          userId: currentUserId
        });
      }
    };
    
    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        
        if (message.sender !== currentUserId && !message.seen && !message.isDeleted) {
          socket.emit("seen", { 
            conversationId, 
            messageId: [message._id], 
            userId: currentUserId 
          });
        }
        scrollToBottom();
      }
    };
    
    const handleMessageEdited = (updatedMessage) => {
      if (updatedMessage.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === updatedMessage._id ? { ...updatedMessage } : msg))
        );
      }
    };
    
    const handleMessageDeleted = ({ messageId, isDeleted }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted } : msg))
      );
    };
    
    socket.on("messages", handleMessages);
    socket.on("message", handleNewMessage);
    socket.on("seen", (messageIds) => {
      const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
      setMessages((prev) => 
        prev.map((msg) => ids.includes(msg._id) ? { ...msg, seen: true } : msg)
      );
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

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessage = (messageId) => {
    const messageRef = messageRefs.current[messageId];
    if (messageRef) {
      messageRef.scrollIntoView({ behavior: "smooth", block: "center" });
      messageRef.classList.add("highlight-reply");
      setTimeout(() => messageRef.classList.remove("highlight-reply"), 3000);
    }
  };

  // Format functions
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Invalid" 
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatLastActive = (lastActive) => {
    if (!lastActive) return "Last seen: Unknown";
    
    const now = new Date();
    const date = new Date(lastActive);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    
    if (diffMin < 1) return "Last seen: Just now";
    if (diffMin < 60) return `Last seen: ${diffMin}m ago`;
    if (diffDay < 1) return `Last seen: Today at ${formatTime(lastActive)}`;
    if (diffDay === 1) return `Last seen: Yesterday at ${formatTime(lastActive)}`;
    if (diffDay < 7) return `Last seen: ${diffDay}d ago`;
    
    return `Last seen: ${formatDate(lastActive)}`;
  };

  // Send message
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

  // Context menu handlers
  const handleContextMenu = (e, message) => {
    if (message.isDeleted) return;
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
    setEditText(text);
    setContextMenu(null);
  };

  const handleDelete = (id) => {
    setDeleteModal({ messageId: id });
    setContextMenu(null);
  };

  const handleSaveEdit = (newText) => {
    if (newText && newText.trim() && newText !== editModal.text) {
      socket.emit("editMessage", { 
        messageId: editModal.messageId, 
        newText: newText.trim(),
        userId: currentUserId
      });
    }
    setEditModal(null);
    setEditText("");
  };

  const handleConfirmDelete = () => {
    socket.emit("deleteMessage", { 
      messageId: deleteModal.messageId,
      userId: currentUserId
    });
    setDeleteModal(null);
  };

  // Clear handlers
  const clearReplay = () => {
    setReplayId(null);
    setReplayMessage(null);
  };

  const closeContextMenu = () => setContextMenu(null);
  const closeEditModal = () => {
    setEditModal(null);
    setEditText("");
  };
  const closeDeleteModal = () => setDeleteModal(null);

  // Click outside handlers
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

  // Render date separator
  const renderDateSeparator = (date, index) => {
    if (index === 0) return true;
    
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    const currentDate = new Date(date).toDateString();
    
    return prevDate !== currentDate;
  };

  // Theme classes
  const themeClass = darkMode 
    ? "bg-gray-900 text-white" 
    : "bg-gray-100 text-gray-900";
  
  const sidebarClass = darkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-200";
  
  const inputClass = darkMode 
    ? "bg-gray-700 text-white placeholder-gray-400" 
    : "bg-gray-100 text-gray-900 placeholder-gray-500";
  
  const messageOwnClass = darkMode 
    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" 
    : "bg-gradient-to-r from-blue-500 to-blue-400 text-white";
  
  const messageOtherClass = darkMode 
    ? "bg-gray-700 text-gray-200" 
    : "bg-gray-200 text-gray-800";
  
  const headerClass = darkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-200";
  
  const modalClass = darkMode 
    ? "bg-gray-800" 
    : "bg-white";

  return (
    <div className={`flex h-screen ${themeClass} font-sans transition-colors duration-300`}>
      {/* Conversations sidebar */}
      <div className={`${conversationId ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col ${sidebarClass} border-r shadow-lg transition-colors duration-300`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold text-blue-500">Messages</h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
            >
              {darkMode ? (
                <IoIosSunny className="text-xl text-yellow-400" />
              ) : (
                <IoIosMoon className="text-xl text-gray-700" />
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full p-3 ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 transition-colors duration-300`}
            />
            <svg 
              className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            conversations
              .filter((chat) => 
                chat.participant?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((chat) => (
                <div
                  key={chat._id}
                  className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${conversationId === chat._id ? "bg-gray-700" : ""}`}
                  onClick={() => navigate(`/message/${chat._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={chat.participant?.profile || "/default-avatar.png"}
                        alt={chat.participant?.fullName || "User"}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${activeUsers.includes(chat.participant?._id.toString()) ? "bg-green-500" : "bg-gray-500"}`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{chat.participant?.fullName || "Unknown"}</h3>
                        <span className="text-xs text-gray-400">
                          {chat.lastMessage?.timestamp ? formatTime(chat.lastMessage.timestamp) : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-400 truncate">
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                        {chat.unseen > 0 && (
                          <span className="bg-blue-500 text-xs font-bold px-2 py-0.5 rounded-full text-white">
                            {chat.unseen}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col" onContextMenu={(e) => e.preventDefault()}>
        {conversationId ? (
          <>
            {/* Chat header */}
            <div className={`p-4 ${headerClass} border-b flex items-center gap-3 sticky top-0 z-10 shadow-md transition-colors duration-300`}>
              <button
                className="md:hidden p-2 rounded-full hover:bg-gray-700 transition-colors"
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
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${currentUserInfo?.isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></span>
              </div>
              <div className="flex-1">
                <h2 
                  onClick={() => navigate(`/profile/${currentUserInfo?.username}`)}
                  className="font-semibold cursor-pointer text-lg"
                >
                  {currentUserInfo?.fullName || "Unknown"}
                </h2>
                <p className="text-sm text-gray-400">
                  {currentUserInfo?.isActive 
                    ? "Active now" 
                    : formatLastActive(currentUserInfo?.lastActive)}
                </p>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-2 transition-colors duration-300">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-5xl mb-4">💬</div>
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-2">Start a conversation by sending a message</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.sender === currentUserId;
                  const showDateSeparator = renderDateSeparator(message.createdAt, index);
                  
                  return (
                    <div key={message._id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'} transition-colors duration-300`}>
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div
                        ref={(el) => (messageRefs.current[message._id] = el)}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        onContextMenu={(e) => handleContextMenu(e, message)}
                      >
                        <div
                          className={`max-w-[80%] lg:max-w-[70%] p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                            isOwnMessage
                              ? `${messageOwnClass} rounded-br-none`
                              : `${messageOtherClass} rounded-bl-none`
                          }`}
                        >
                          {message.isDeleted ? (
                            <p className="text-sm italic text-gray-400">This message was deleted</p>
                          ) : (
                            <>
                              {message.replyTo && (
                                <div
                                  className={`mb-2 p-3 ${darkMode ? 'bg-gray-600/30' : 'bg-gray-300/50'} rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors duration-200`}
                                  onClick={() => scrollToMessage(message.replyTo.id)}
                                >
                                  <p className="text-xs text-gray-400 italic">
                                    {isOwnMessage ? "You replied to:" : "Replying to:"}
                                  </p>
                                  <p className="text-sm truncate text-gray-300">{message.replyTo.message}</p>
                                </div>
                              )}
                              <p className="text-sm">{message.text}</p>
                              <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-300">
                                <span>{formatTime(message.createdAt)}</span>
                                {message.isEdited && <span className="text-gray-400 italic">Edited</span>}
                                {isOwnMessage && (
                                  <span className={`w-2 h-2 rounded-full ${message.seen ? "bg-green-400" : "bg-gray-400"}`}></span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className={`p-4 ${headerClass} border-t shadow-lg transition-colors duration-300`}>
              {replayId && (
                <div className={`mb-3 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex justify-between items-center shadow-sm transition-colors duration-300`}>
                  <div className="flex-1">
                    <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>Replying to:</p>
                    <p className="text-sm truncate">{replayMessage}</p>
                  </div>
                  <IoIosClose
                    onClick={clearReplay}
                    className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className={`flex-1 p-4 ${inputClass} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors duration-300`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className={`p-4 rounded-full transition-colors duration-200 flex items-center justify-center ${
                    inputText.trim()
                      ? `${messageOwnClass} shadow-lg`
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-300'} cursor-not-allowed`
                  }`}
                >
                  <IoMdSend className="text-xl" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6">💬</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Messenger</h2>
              <p className="mb-6 text-gray-500">Select a conversation from the list or start a new chat</p>
              <button
                onClick={() => navigate("/")}
                className={`px-6 py-3 ${messageOwnClass} rounded-full font-medium shadow-lg transition-colors duration-200`}
              >
                Browse Users
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={`absolute ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-xl z-20 transition-colors duration-300`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul className="py-2 text-sm">
            <li
              className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} cursor-pointer transition-colors duration-150 flex items-center gap-2`}
              onClick={() => handleReplay(contextMenu.messageId, contextMenu.text)}
            >
              Reply
            </li>
            {contextMenu.isOwnMessage && (
              <>
                <li
                  className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} cursor-pointer transition-colors duration-150 flex items-center gap-2`}
                  onClick={() => handleEdit(contextMenu.messageId, contextMenu.text)}
                >
                  Edit
                </li>
                <li
                  className={`px-4 py-3 ${darkMode ? 'hover:bg-red-700' : 'hover:bg-red-100'} cursor-pointer transition-colors duration-150 flex items-center gap-2`}
                  onClick={() => handleDelete(contextMenu.messageId)}
                >
                  Delete
                </li>
              </>
            )}
          </ul>
        </div>
      )}
      
      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30 transition-opacity duration-300">
          <div ref={editModalRef} className={`${modalClass} p-6 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Message</h3>
              <IoIosClose
                onClick={closeEditModal}
                className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
              />
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className={`w-full p-3 ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none transition-colors duration-300`}
              rows="3"
              placeholder="Edit your message..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className={`px-5 py-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full hover:bg-gray-600 transition-colors duration-200 text-sm font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editText)}
                className={`px-5 py-2.5 ${messageOwnClass} rounded-full hover:from-blue-500 hover:to-blue-400 transition-colors duration-200 text-sm font-medium shadow-md`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30 transition-opacity duration-300">
          <div ref={deleteModalRef} className={`${modalClass} p-6 rounded-lg shadow-xl w-full max-w-sm transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Delete Message</h3>
              <IoIosClose
                onClick={closeDeleteModal}
                className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
              />
            </div>
            <p className="text-sm text-gray-300 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className={`px-5 py-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full hover:bg-gray-600 transition-colors duration-200 text-sm font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-full hover:from-red-500 hover:to-red-400 transition-colors duration-200 text-sm font-medium shadow-md`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;