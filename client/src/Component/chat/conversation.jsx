import { useEffect, useState } from "react";
import { socket } from "../../utils/socket.js";
import { useNavigate, useParams } from "react-router-dom";

const Conversation = () => {
  const [conversations, setConversations] = useState([]);
  const { conversationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const userId = localStorage.getItem("id")?.toString();
    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    socket.emit("getConversation", { userId });

    const handleConversations = (data) => {
      if (!Array.isArray(data)) {
        console.error("Expected an array of conversations, got:", data);
        return;
      }
      setConversations(data);
    };

    socket.on("getConversation", handleConversations);

    return () => {
      socket.off("getConversation", handleConversations);
    };
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleUpdateConversation = (updatedConversation) => {
      setConversations((prevConversations) => {
        const updatedList = prevConversations.map((chat) =>
          chat._id === updatedConversation._id ? { ...chat, ...updatedConversation } : chat
        );
        const sortedList = updatedList.sort(
          (a, b) =>
            new Date(b.lastMessage?.timestamp || b.updatedAt) -
            new Date(a.lastMessage?.timestamp || a.updatedAt)
        );
        return sortedList;
      });
    };

    socket.on("updateConversation", handleUpdateConversation);

    return () => {
      socket.off("updateConversation", handleUpdateConversation);
    };
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const now = new Date();
    const diff = now - date;

    return diff < 24 * 60 * 60 * 1000
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  const handleConversationClick = (id) => {
    navigate(`/message/${id}`);
  };

  return (
    <div className="w-full sm:w-1/2 md:w-2/5 lg:w-1/3 h-full bg-white overflow-y-auto border-r border-gray-200">
      <div className="p-3 sm:p-4 border-b bg-green-500 text-white flex justify-center text-base sm:text-lg md:text-xl font-semibold">
        Conversations
      </div>
      <div className="divide-y">
        {conversations.map((chat) => {
          const currentUserId = localStorage.getItem("id");
          const hasLastMessage = !!chat.lastMessage;

          const lastMessageContent = hasLastMessage
            ? chat.lastMessage.content || "No message content"
            : "No messages yet";

          const timeStamp = hasLastMessage
            ? chat.lastMessage.timestamp || chat.updatedAt
            : chat.updatedAt;

          const myMessage = chat.lastMessage?.sender === currentUserId;
          const seen = chat.lastMessage?.seen;

          return (
            <div
              key={chat._id}
              className={`flex items-center p-2 sm:p-3 md:p-4 hover:bg-gray-100 cursor-pointer ${
                conversationId === chat._id ? "bg-gray-200" : ""
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
                  <span className="text-xs sm:text-sm md:text-base text-gray-500">
                    {formatTime(timeStamp)}
                  </span>
                </div>
                <div className="flex items-center">
                  <p
                    className={`text-xs sm:text-sm md:text-base truncate ${
                      seen ? "text-gray-500" : "text-gray-900 font-medium"
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
  );
};

export default Conversation;