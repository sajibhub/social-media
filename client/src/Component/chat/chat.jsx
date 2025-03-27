import { useEffect, useRef, useState } from "react";
import { socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const { conversationId } = useParams();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]); // Clear messages if no conversation is selected
      return;
    }

    // Ensure socket is connected only once
    if (!socket.connected) {
      socket.connect();
    }

    const userId = localStorage.getItem("id")?.toString();
    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    socket.emit("join", conversationId);
    socket.emit("messages", { userId, conversationId });

    const handleMessages = (data) => {
      if (!Array.isArray(data)) {
        console.error("Expected array of messages, got:", data);
        return;
      }
      setMessages(data);
      const unreadMessageIds = data
        .filter((message) => !message.seen && message.sender !== userId)
        .map((message) => message._id);
      if (unreadMessageIds.length > 0) {
        socket.emit("seen", { conversationId, messageId: unreadMessageIds, senderId: userId });
      }
    };

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (message.sender !== userId && !message.seen) {
          socket.emit("seen", { conversationId, messageId: [message._id], senderId: userId });
        }
        scrollToBottom();
      }
    };

    const handleSeen = (messageIds) => {
      const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          ids.includes(msg._id) ? { ...msg, seen: true } : msg
        )
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
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const currentUserId = localStorage.getItem("id");

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
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-3 sm:p-4 border-b bg-green-500 text-white text-center font-semibold text-base sm:text-lg md:text-xl sticky top-0 z-10">
        Chat
      </div>
      {conversationId ? (
        <>
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 scrollbar-none">
            {messages.map((message) => {
              const isOwnMessage = message.sender === currentUserId;
              return (
                <div key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] xs:max-w-[75%] sm:max-w-[70%] md:max-w-[60%] p-2 sm:p-3 rounded-lg shadow-md ${
                      isOwnMessage ? "bg-green-500 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <p className="text-xs sm:text-sm md:text-base">{message.text}</p>
                    <div className="flex justify-between items-center mt-1 text-xs sm:text-sm text-gray-600">
                      <span>{formatTime(message.createdAt)}</span>
                      {isOwnMessage && (
                        <span
                          className={`ml-2 inline-block w-2 h-2 rounded-full transition-all duration-200 ${
                            message.seen ? "bg-blue-500 scale-125" : "bg-gray-300"
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
          <div className="p-2 sm:p-3 md:p-4 border-t bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-full text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 px-3 sm:px-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-xs sm:text-sm md:text-base"
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
  );
};

export default Chat;