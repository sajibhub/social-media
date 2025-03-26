import { useEffect, useRef, useState } from "react";
import { socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const { conversationId } = useParams(); // Get conversationId from URL params
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      console.log("No conversation ID provided.");
      return; // If no conversationId, stop the effect early
    }

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join", conversationId);

    const userId = localStorage.getItem("id")?.toString();
    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    socket.emit("messages", { userId, conversationId });

    const handleMessages = (data) => {
      if (!Array.isArray(data)) {
        console.error("Expected array of messages, got:", data);
        return;
      }
      setMessages(data.filter((msg) => !msg.isDeleted));
    };

    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    };

    socket.on("messages", handleMessages);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("messages", handleMessages);
      socket.off("message", handleNewMessage);
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

  if (!conversationId) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="p-4 border-b bg-green-500 text-white text-center font-semibold text-xl">
          Chat
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No conversation selected. Please select a conversation to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b bg-green-500 text-white text-center font-semibold text-xl">
        Chat
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "none" }}>
        {messages.map((message) => {
          const isOwnMessage = message.sender === currentUserId;
          return (
            <div key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs p-3 rounded-lg shadow-md ${
                  isOwnMessage ? "bg-green-500 text-white" : "bg-gray-200 text-gray-900"
                }`}
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap", // Ensures line breaks are maintained
                }}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                  <span>{formatTime(message.createdAt)}</span>
                  {isOwnMessage && <span>{message.seen ? "Seen" : "Sent"}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="p-4 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSendMessage}
          className="p-2 px-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
