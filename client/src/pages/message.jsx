import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket.js";
import { useParams, useNavigate } from "react-router-dom";
import { 
  IoIosClose, IoMdSend, IoIosSunny, IoIosMoon, IoIosVideocam, 
  IoIosCall, IoIosInformationCircle, IoIosAdd, IoIosSearch,
  IoIosAttach, IoIosMic, IoIosHappy, IoIosArrowBack, IoIosRefresh
} from "react-icons/io";
import { 
  BsEmojiSmile, BsImage, BsMic, BsThreeDotsVertical, 
  BsSearch, BsArrowLeft, BsPlusCircle, BsFillFileEarmarkTextFill
} from "react-icons/bs";
import { 
  RiReplyLine, RiEditLine, RiDeleteBinLine, 
  RiGroupLine, RiVoiceprintLine, RiSendPlaneFill
} from "react-icons/ri";
import { 
  FaRegSmile, FaRegLaughSquint, FaRegHeart, 
  FaRegThumbsUp, FaRegLaugh, FaRegSadTear,
  FaSearch, FaTimes, FaRegPaperPlane
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import EmojiPicker from 'emoji-picker-react';

// Custom Media Recorder Hook
const useMediaRecorder = () => {
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setMediaBlobUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearBlobUrl = () => {
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl);
      setMediaBlobUrl(null);
    }
  };

  return {
    startRecording,
    stopRecording,
    mediaBlobUrl,
    isRecording,
    clearBlobUrl
  };
};

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
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [messageMap, setMessageMap] = useState(new Map());
  const [fileUploading, setFileUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
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
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const conversationsFetched = useRef(false);
  const fileInputRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  
  // Custom Media Recorder Hook
  const {
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    isRecording: isMediaRecording
  } = useMediaRecorder();

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Toggle theme
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Dropzone for file uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      handleFileUpload(acceptedFiles[0]);
    },
    noClick: true,
    noKeyboard: true
  });

  // Socket connection
  useEffect(() => {
    if (!currentUserId) return;
    
    // Socket connection event handlers
    const handleConnect = () => {
      console.log("Socket connected");
      setSocketConnected(true);
      socketInitialized.current = true;
      setRetryCount(0);
      
      // Set headers for authentication
      socket.io.opts.extraHeaders = {
        id: currentUserId
      };
      
      // Emit user online status and fetch data
      socket.emit("userOnline");
      fetchConversations();
      if (conversationId) {
        fetchMessages();
      }
    };
    
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    };
    
    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
      // Retry connection with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        socket.connect();
      }, delay);
    };
    
    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    
    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      setSocketConnected(true);
      socketInitialized.current = true;
      fetchConversations();
      if (conversationId) {
        fetchMessages();
      }
    }
    
    // Cleanup function
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [currentUserId, conversationId, retryCount]);

  // Fetch conversations function
  const fetchConversations = () => {
    if (!socketConnected || !currentUserId) return;
    
    setLoading(true);
    socket.emit("getConversation");
  };

  // Fetch messages function
  const fetchMessages = () => {
    if (!socketConnected || !conversationId) return;
    
    setMessagesLoading(true);
    socket.emit("messages", { conversationId });
  };

  // Manual refresh function
  const refreshData = () => {
    fetchConversations();
    if (conversationId) {
      fetchMessages();
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socketConnected) return;
    
    const handleActiveUsers = (users) => setActiveUsers(users);
    const handleUserTyping = (data) => {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      setIsTyping(true);
    };
    const handleUserStopTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      if (typingUsers.length <= 1) setIsTyping(false);
    };
    const handleMessageReaction = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
      ));
    };
    const handleSearchResults = (data) => {
      setSearchResults(data.messages);
    };
    
    socket.on("activeUsers", handleActiveUsers);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("searchResults", handleSearchResults);
    
    return () => {
      socket.off("activeUsers", handleActiveUsers);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("searchResults", handleSearchResults);
    };
  }, [socketConnected, typingUsers]);

  // Update message map when messages change
  useEffect(() => {
    const newMessageMap = new Map();
    messages.forEach(msg => {
      newMessageMap.set(msg._id, msg);
    });
    setMessageMap(newMessageMap);
  }, [messages]);

  // Conversations
  useEffect(() => {
    if (!socketConnected || !currentUserId) return;
    
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
  }, [socketConnected, currentUserId, conversationId, activeUsers]);

  // Messages
  useEffect(() => {
    if (!socketConnected || !conversationId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }
    
    const handleMessages = (data) => {
      // Backend returns { messages: [...], page, hasMore }
      if (!data || !data.messages || !Array.isArray(data.messages)) return;
      setMessages(data.messages);
      setMessagesLoading(false);
      
      const unreadMessageIds = data.messages
        .filter((msg) => !msg.seen && msg.sender !== currentUserId && !msg.isDeleted)
        .map((msg) => msg._id);
        
      if (unreadMessageIds.length > 0) {
        socket.emit("seen", { 
          conversationId, 
          messageId: unreadMessageIds,
        });
      }
    };
    
    const handleMessage = (message) => {
      // Backend emits "message" for new messages
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        
        if (message.sender !== currentUserId && !message.seen && !message.isDeleted) {
          socket.emit("seen", { 
            conversationId, 
            messageId: [message._id], 
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
      
      // If the deleted message is the one being replied to, clear the reply
      if (replayId === messageId) {
        setReplayId(null);
        setReplayMessage(null);
      }
    };
    
    socket.on("messages", handleMessages);
    socket.on("message", handleMessage);
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
  }, [socketConnected, conversationId, currentUserId, replayId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle voice recording
  useEffect(() => {
    if (mediaBlobUrl) {
      // Convert blob URL to blob object
      fetch(mediaBlobUrl)
        .then(res => res.blob())
        .then(blob => {
          handleVoiceMessage(blob);
          clearBlobUrl();
        });
    }
  }, [mediaBlobUrl]);

  // Recording timer
  useEffect(() => {
    if (isMediaRecording) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setRecordingInterval(interval);
    } else if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
      setRecordingTime(0);
    }
    
    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
    };
  }, [isMediaRecording]);

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

  // Get reply message text - Fixed to handle deleted messages
  const getReplyMessageText = (replyToId) => {
    if (!replyToId) return "Deleted message";
    
    const originalMessage = messageMap.get(replyToId);
    if (!originalMessage || originalMessage.isDeleted) {
      return "Deleted message";
    }
    
    return originalMessage.text;
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

  // Typing handlers
  const handleTypingStart = () => {
    if (conversationId) {
      socket.emit("typingStart", { conversationId });
    }
  };
  
  const handleTypingStop = () => {
    if (conversationId) {
      socket.emit("typingStop", { conversationId });
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim() || !conversationId || !currentUserId) return;
    
    const messageData = {
      conversationId,
      text: inputText.trim(),
      replyTo: replayId ? { id: replayId, message: getReplyMessageText(replayId) } : null,
    };
    
    socket.emit("message", messageData);
    setInputText("");
    setReplayId(null);
    setReplayMessage(null);
    handleTypingStop();
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    if (!file || !conversationId) return;
    
    setFileUploading(true);
    const fileType = file.type.startsWith('image/') ? 'image' : 'file';
    
    socket.emit("uploadFile", {
      conversationId,
      file,
      fileName: file.name,
      fileType
    });
    
    setFileUploading(false);
  };

  // Handle voice message
  const handleVoiceMessage = (audioBlob) => {
    if (!audioBlob || !conversationId) return;
    
    socket.emit("uploadVoice", {
      conversationId,
      audioBlob,
      duration: recordingTime
    });
  };

  // Start/stop voice recording
  const toggleRecording = () => {
    if (isMediaRecording) {
      stopRecording();
      setRecording(false);
    } else {
      startRecording();
      setRecording(true);
    }
  };

  // Handle message reaction
  const handleReaction = (messageId, emoji) => {
    socket.emit("messageReaction", { messageId, emoji });
    setShowReactionPicker(null);
  };

  // Handle search
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    socket.emit("searchMessages", {
      conversationId,
      query: query.trim(),
      page: 1,
      limit: 20
    });
  };

  // Emoji handling
  const handleEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  // Common emojis for reactions
  const commonReactions = ['❤️', '😂', '😮', '😢', '😡', '👍'];

  // Context menu handlers
  const handleContextMenu = (e, message) => {
    if (message.isDeleted) return;
    e.preventDefault();
    
    const menuWidth = 200;
    const menuHeight = 180;
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
      });
    }
    setEditModal(null);
    setEditText("");
  };

  const handleConfirmDelete = () => {
    socket.emit("deleteMessage", { 
      messageId: deleteModal.messageId,
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
  const closeGroupCreate = () => setShowGroupCreate(false);
  const closeSearch = () => {
    setShowSearch(false);
    setSearchResults([]);
  };

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
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (showReactionPicker && reactionPickerRef.current && !reactionPickerRef.current.contains(e.target)) {
        setShowReactionPicker(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu, editModal, deleteModal, showEmojiPicker, showReactionPicker]);

  // Render date separator
  const renderDateSeparator = (date, index) => {
    if (index === 0) return true;
    
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    const currentDate = new Date(date).toDateString();
    
    return prevDate !== currentDate;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Theme classes
  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";
  
  const sidebarClass = darkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border-gray-700" 
    : "bg-white/90 backdrop-blur-sm border-gray-200";
  
  const inputClass = darkMode 
    ? "bg-gray-700/80 backdrop-blur-sm text-white placeholder-gray-400 border-gray-600" 
    : "bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 border-gray-300";
  
  const messageOwnClass = darkMode 
    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg";
  
  const messageOtherClass = darkMode 
    ? "bg-gray-700/80 backdrop-blur-sm text-gray-100 shadow-md" 
    : "bg-white/80 backdrop-blur-sm text-gray-800 shadow-md";
  
  const headerClass = darkMode 
    ? "bg-gray-800/90 backdrop-blur-sm border-gray-700" 
    : "bg-white/90 backdrop-blur-sm border-gray-200";
  
  const modalClass = darkMode 
    ? "bg-gray-800/95 backdrop-blur-sm" 
    : "bg-white/95 backdrop-blur-sm";

  // Start a new conversation
  const startNewConversation = (userId) => {
    socket.emit("conversationCreated", { receiverId: userId });
  };

  return (
    <div className={`flex h-screen ${themeClass} font-sans transition-all duration-300 overflow-hidden`} {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Conversations sidebar */}
      <div className={`${conversationId ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col ${sidebarClass} border-r shadow-xl transition-all duration-300`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Messages</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
              >
                {darkMode ? (
                  <IoIosSunny className="text-xl text-yellow-400" />
                ) : (
                  <IoIosMoon className="text-xl text-gray-700" />
                )}
              </button>
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
              >
                <IoIosSearch className="text-xl" />
              </button>
              <button 
                onClick={() => setShowGroupCreate(true)}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
              >
                <RiGroupLine className="text-xl" />
              </button>
              <button 
                onClick={refreshData}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
                title="Refresh"
              >
                <IoIosRefresh className="text-xl" />
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full p-3 ${inputClass} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 transition-all duration-300 border`}
            />
            <BsSearch className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
          </div>
          
          {/* Connection status indicator */}
          <div className="flex items-center mt-2 text-xs">
            <div className={`w-2 h-2 rounded-full mr-1 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{socketConnected ? 'Connected' : 'Connecting...'}</span>
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
                chat.participant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((chat) => (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${conversationId === chat._id ? "bg-gray-700/50" : ""}`}
                  onClick={() => navigate(`/message/${chat._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={chat.participant?.profile || "/default-avatar.png"}
                        alt={chat.participant?.fullName || "User"}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 shadow-md"
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${activeUsers.includes(chat.participant?._id?.toString()) ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></span>
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
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-md">
                            {chat.unseen}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col" onContextMenu={(e) => e.preventDefault()}>
        {conversationId ? (
          <>
            {/* Chat header */}
            <div className={`p-4 ${headerClass} border-b flex items-center justify-between sticky top-0 z-10 shadow-xl backdrop-blur-sm transition-all duration-300`}>
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                  onClick={() => navigate("/conversation")}
                >
                  <IoIosArrowBack className="text-xl" />
                </button>
                <div className="relative">
                  <img
                    onClick={() => navigate(`/profile/${currentUserInfo?.username}`)}
                    src={currentUserInfo?.profile || "/default-avatar.png"}
                    alt={currentUserInfo?.fullName || "User"}
                    className="w-12 h-12 cursor-pointer rounded-full object-cover border-2 border-gray-600 shadow-md"
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
                    {isTyping ? (
                      <span className="text-blue-400 flex items-center">
                        <span className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                        {typingUsers.map(u => u.username).join(', ')} is typing...
                      </span>
                    ) : (
                      currentUserInfo?.isActive 
                        ? "Active now" 
                        : formatLastActive(currentUserInfo?.lastActive)
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-700/50 transition-colors backdrop-blur-sm">
                  <IoIosCall className="text-xl" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-700/50 transition-colors backdrop-blur-sm">
                  <IoIosVideocam className="text-xl" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-700/50 transition-colors backdrop-blur-sm">
                  <IoIosInformationCircle className="text-xl" />
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-2 transition-all duration-300">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading messages...</p>
                    <button 
                      onClick={refreshData}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
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
                          <span className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700/80 backdrop-blur-sm text-gray-300' : 'bg-gray-300/80 backdrop-blur-sm text-gray-700'} transition-all duration-300 shadow-sm`}>
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
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
                                  className={`mb-2 p-3 ${darkMode ? 'bg-gray-600/30 backdrop-blur-sm' : 'bg-gray-300/50 backdrop-blur-sm'} rounded-lg cursor-pointer hover:bg-gray-600/50 transition-all duration-200`}
                                  onClick={() => scrollToMessage(message.replyTo.id)}
                                >
                                  <p className="text-xs text-gray-400 italic">
                                    {isOwnMessage ? "You replied to:" : "Replying to:"}
                                  </p>
                                  <p className="text-sm truncate text-gray-300">
                                    {getReplyMessageText(message.replyTo.id)}
                                  </p>
                                </div>
                              )}
                              
                              {/* File message */}
                              {message.image && (
                                <div className="mb-2 rounded-lg overflow-hidden">
                                  <img
                                    src={message.image.url}
                                    alt="Shared image"
                                    className="max-w-full h-auto rounded-lg shadow-md"
                                  />
                                </div>
                              )}
                              
                              {/* File attachment */}
                              {message.file && (
                                <div className={`mb-2 p-3 ${darkMode ? 'bg-gray-600/30 backdrop-blur-sm' : 'bg-gray-300/50 backdrop-blur-sm'} rounded-lg flex items-center gap-3`}>
                                  <BsFillFileEarmarkTextFill className="text-2xl text-blue-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate font-medium">{message.file.originalName}</p>
                                    <p className="text-xs text-gray-400">
                                      {formatFileSize(message.file.size)}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Voice message */}
                              {message.voiceNote && (
                                <div className="flex items-center gap-3 mb-2 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm">
                                  <button className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white shadow-md">
                                    <RiVoiceprintLine className="text-lg" />
                                  </button>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-48 h-2 bg-gray-600 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {Math.floor(message.voiceNote.duration / 60)}:
                                        {(message.voiceNote.duration % 60).toString().padStart(2, '0')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <p className="text-sm">{message.text}</p>
                              
                              {/* Message reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {message.reactions.map((reaction, idx) => (
                                    <span
                                      key={idx}
                                      className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600/50 backdrop-blur-sm' : 'bg-gray-300/50 backdrop-blur-sm'} shadow-sm`}
                                    >
                                      {reaction.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between gap-2 mt-2 text-xs text-gray-300">
                                <span>{formatTime(message.createdAt)}</span>
                                {message.isEdited && <span className="text-gray-400 italic">Edited</span>}
                                {isOwnMessage && (
                                  <span className={`w-2 h-2 rounded-full ${message.seen ? "bg-green-400" : "bg-gray-400"}`}></span>
                                )}
                              </div>
                            </>
                          )}
                          
                          {/* Reaction button */}
                          {!message.isDeleted && (
                            <div className="flex justify-end mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowReactionPicker(showReactionPicker === message._id ? null : message._id);
                                }}
                                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <FaRegSmile />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Reaction picker */}
                        {showReactionPicker === message._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            ref={reactionPickerRef}
                            className={`absolute bottom-full mb-2 ${isOwnMessage ? 'right-0' : 'left-0'} flex gap-1 p-2 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} rounded-full shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                          >
                            {commonReactions.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message._id, emoji)}
                                className="p-1 text-lg hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  );
                })
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className={`p-4 ${headerClass} border-t shadow-xl backdrop-blur-sm transition-all duration-300`}>
              {replayId && (
                <div className={`mb-3 p-3 ${darkMode ? 'bg-gray-700/80 backdrop-blur-sm' : 'bg-gray-200/80 backdrop-blur-sm'} rounded-lg flex justify-between items-center shadow-sm transition-all duration-300`}>
                  <div className="flex-1">
                    <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>Replying to:</p>
                    <p className="text-sm truncate">{getReplyMessageText(replayId)}</p>
                  </div>
                  <IoIosClose
                    onClick={clearReplay}
                    className="text-2xl cursor-pointer hover:text-gray-200 transition-colors"
                  />
                </div>
              )}
              
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-3 rounded-full hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <BsEmojiSmile className="text-xl" />
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <BsImage className="text-xl" />
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  accept="image/*, .pdf, .doc, .docx"
                />
                
                <button 
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm ${isMediaRecording ? 'bg-red-500/90 text-white' : 'hover:bg-gray-700/50'}`}
                >
                  {isMediaRecording ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">{recordingTime}s</span>
                    </div>
                  ) : (
                    <BsMic className="text-xl" />
                  )}
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleTypingStart();
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    onBlur={handleTypingStop}
                    placeholder="Type a message..."
                    className={`w-full p-4 ${inputClass} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300 border`}
                  />
                  
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute bottom-full mb-2 left-0 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-2 w-80 h-80 overflow-hidden"
                    >
                      <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        theme={darkMode ? 'dark' : 'light'}
                        skinTonesDisabled
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && !fileUploading}
                  className={`p-4 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg ${inputText.trim() ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'bg-gray-700/50 backdrop-blur-sm hover:bg-gray-700/50'} disabled:opacity-50`}
                >
                  <RiSendPlaneFill className="text-xl" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">💬</div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Welcome to Messenger</h2>
              <p className="mb-6 text-gray-500">Select a conversation from the list or start a new chat</p>
              <button
                onClick={() => navigate("/search")}
                className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              >
                Browse Users
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            ref={contextMenuRef}
            className={`absolute ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border z-50`}
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <div className="py-1">
              <button
                onClick={() => handleReplay(contextMenu.messageId, contextMenu.text)}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
              >
                <RiReplyLine className="mr-2" /> Reply
              </button>
              {contextMenu.isOwnMessage && (
                <>
                  <button
                    onClick={() => handleEdit(contextMenu.messageId, contextMenu.text)}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                  >
                    <RiEditLine className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contextMenu.messageId)}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-500/20 text-red-500 transition-colors"
                  >
                    <RiDeleteBinLine className="mr-2" /> Delete
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              ref={editModalRef}
              className={`${modalClass} rounded-xl shadow-xl w-full max-w-md overflow-hidden`}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Edit Message</h3>
                <button onClick={closeEditModal} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className={`w-full p-3 ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border`}
                  rows={3}
                  autoFocus
                />
              </div>
              
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(editText)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              ref={deleteModalRef}
              className={`${modalClass} rounded-xl shadow-xl w-full max-w-md overflow-hidden`}
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Delete Message</h3>
              </div>
              
              <div className="p-4">
                <p>Are you sure you want to delete this message? This action cannot be undone.</p>
              </div>
              
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${modalClass} rounded-xl shadow-xl w-full max-w-2xl max-h-96 overflow-hidden`}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Search Messages</h3>
                <button onClick={closeSearch} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full p-3 ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 transition-all duration-300 border`}
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
                
                <div className="overflow-y-auto max-h-64">
                  {searchResults.length > 0 ? (
                    searchResults.map(message => (
                      <div key={message._id} className="p-3 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors">
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(message.createdAt)} • {message.sender?.fullName}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No messages found</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add custom styles for the typing indicator */}
      <style jsx>{`
        .typing-dots {
          display: inline-flex;
          align-items: center;
          margin-right: 8px;
        }
        .typing-dots span {
          height: 4px;
          width: 4px;
          border-radius: 50%;
          background-color: currentColor;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(1) { animation-delay: 0s; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .highlight-reply {
          animation: highlight 3s ease;
        }
        @keyframes highlight {
          0% { background-color: rgba(59, 130, 246, 0.3); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default Message;