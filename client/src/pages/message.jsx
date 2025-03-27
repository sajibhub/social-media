import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket.js";
import { useParams, useNavigate } from "react-router-dom";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Added search query state
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("id");

  // Handle Conversations
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (!currentUserId) {
      console.error("No userId found in localStorage");
      return;
    }

    socket.emit("getConversation", { userId: currentUserId });

    const handleConversations = (data) => {
      if (!Array.isArray(data)) {
        console.error("Expected an array of conversations, got:", data);
        return;
      }
      setConversations(data);
    };

    const handleNewConversation = (newConversation) => {
      setConversations((prev) => {
        if (prev.some((chat) => chat._id === newConversation._id)) return prev;
        return [...prev, newConversation].sort(
          (a, b) => new Date(b.lastMessage?.timestamp || b.updatedAt) -
            new Date(a.lastMessage?.timestamp || a.updatedAt)
        );
      });
    };

    const handleUpdateConversation = (updatedConversation) => {
      setConversations((prev) => {
        const updatedList = prev.map((chat) =>
          chat._id === updatedConversation._id ? { ...chat, ...updatedConversation } : chat
        );
        return updatedList.sort(
          (a, b) => new Date(b.lastMessage?.timestamp || b.updatedAt) -
            new Date(a.lastMessage?.timestamp || a.updatedAt)
        );
      });
    };

    socket.on("getConversation", handleConversations);
    socket.on("conversationCreated", handleNewConversation);
    socket.on("updateConversation", handleUpdateConversation);

    return () => {
      socket.off("getConversation", handleConversations);
      socket.off("conversationCreated", handleNewConversation);
      socket.off("updateConversation", handleUpdateConversation);
    };
  }, [currentUserId]);

  // Handle Messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", conversationId);
    socket.emit("messages", { userId: currentUserId, conversationId });

    const handleMessages = (data) => {
      if (!Array.isArray(data)) {
        console.error("Expected array of messages, got:", data);
        return;
      }
      setMessages(data);
      const unreadMessageIds = data
        .filter((message) => !message.seen && message.sender !== currentUserId)
        .map((message) => message._id);
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

    const handleSeen = (messageIds) => {
      const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
      setMessages((prev) =>
        prev.map((msg) => ids.includes(msg._id) ? { ...msg, seen: true } : msg)
      );
    };

    socket.on("messages", handleMessages);
    socket.on("message", handleNewMessage);
    socket.on("seen", handleSeen);

    return () => {
      socket.off("messages", handleMessages);
      socket.off("message", handleNewMessage);
      socket.off("seen", handleSeen);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const now = new Date();
    const diff = now - date;
    return diff < 24 * 60 * 60 * 1000
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !conversationId || !currentUserId) return;

    const messageData = {
      conversationId,
      sender: currentUserId,
      text: inputText.trim(),
    };

    socket.emit("message", JSON.stringify(messageData));
    setInputText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleConversationClick = (id) => {
    navigate(`/message/${id}`);
  };

  useEffect(() => {
    if (conversations && currentUserId) {
      const userConversation = conversations.filter(conversation =>
        conversation.participants.includes(currentUserId)
      );

      if (userConversation.length > 0) {
        const opponent = userConversation[0].participants.find(participantId => participantId !== currentUserId);
        const opponentProfile = userConversation[0].participant;

        setCurrentUserInfo(opponentProfile);
      }
    }
  }, [conversations, currentUserId]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((chat) =>
    chat.participant?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col sm:flex-row h-screen w-full bg-gray-900 text-white">
      {/* Conversations Panel */}
      <div
        className={`${conversationId ? "hidden sm:block" : "block"
          } w-full sm:w-1/2 md:w-2/5 lg:w-1/3 h-full bg-gray-800 overflow-y-auto border-r border-gray-700`}
      >
        <div className="p-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 bg-gray-700 text-white border rounded-lg"
          />
        </div>
        <div className="divide-y">
          {filteredConversations.map((chat) => {
            const hasLastMessage = !!chat.lastMessage;
            const lastMessageContent = hasLastMessage
              ? chat.lastMessage.content || "No message content"
              : "No messages yet";
            const myMessage = chat.lastMessage?.sender === currentUserId;
            const seen = chat.lastMessage?.seen;

            return (
              <div
                key={chat._id}
                className={`flex items-center p-2 sm:p-3 md:p-4 hover:bg-gray-700 cursor-pointer ${conversationId === chat._id ? "bg-gray-600" : ""
                  }`}
                onClick={() => handleConversationClick(chat._id)}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-3 overflow-hidden">
                  <img
                    src={chat.participant?.profile || "/default-avatar.png"}
                    alt={chat.participant?.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm sm:text-base md:text-lg font-medium truncate">
                      {chat.participant?.fullName || "Unknown User"}
                    </h2>
                  </div>
                  <div className="flex items-center">
                    <p
                      className={`text-xs sm:text-sm md:text-base truncate ${seen ? "text-gray-500" : "text-white font-medium"
                        }`}
                    >
                      {lastMessageContent}
                    </p>
                    {!myMessage && !seen && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`${conversationId ? "block" : "hidden sm:block"
          } flex-1 flex flex-col h-full w-full sm:w-auto`}
      >
        {/* Chat Header */}
        <div className="p-3 flex sm:p-4 border-b bg-gray-800 text-white text-center font-semibold text-base sm:text-lg md:text-xl sticky top-0 z-10">
          {conversationId && (
            <div className="flex justify-between items-center w-full ">
              <button
                className="sm:hidden w-28 left-2 top-2 p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
                onClick={() => navigate("/conversation")}
              >
                ← Back
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="ml-5">
                  <img
                    src={currentUserInfo?.profile || "/default-avatar.png"}
                    alt={currentUserInfo?.fullName || "User"}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white"
                  />
                  {/* Active Status Dot */}
                  {currentUserInfo?.isActive && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="text-center">
                  <h2 className="text-sm sm:text-base md:text-lg font-medium truncate">
                    {currentUserInfo?.fullName || "Unknown User"}
                  </h2>
                  <p className="text-xs sm:text-sm text-green-100">
                    {currentUserInfo?.isActive ? (
                      "Active now"
                    ) : currentUserInfo?.lastSeen ? (
                      `Last seen: ${new Date(currentUserInfo.lastSeen).toLocaleString()}`
                    ) : (
                      "Last seen: Unknown"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {conversationId ? (
          <>
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
              {messages.map((message) => {
                const isOwnMessage = message.sender === currentUserId;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] xs:max-w-[75%] sm:max-w-[70%] md:max-w-[60%] p-2 sm:p-3 rounded-lg shadow-md ${isOwnMessage ? "bg-gray-700 text-white" : "bg-gray-600 text-gray-300"
                        }`}
                      style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}
                    >
                      <p className="text-xs sm:text-sm md:text-base">{message.text}</p>
                      <div className="flex justify-between items-center mt-1 text-xs sm:text-sm text-gray-400">
                        <span>{formatTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <span
                            className={`ml-2 inline-block w-2 h-2 rounded-full transition-all duration-200 ${message.seen ? "bg-blue-500 scale-125" : "bg-gray-300"
                              }`}
                          ></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="p-2 sm:p-3 md:p-4 border-t bg-gray-800 flex items-center gap-2 shrink-0 sticky bottom-0 z-10">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-gray-700 text-white border rounded-full text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 px-3 sm:px-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition text-xs sm:text-sm md:text-base"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm sm:text-base md:text-lg">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
