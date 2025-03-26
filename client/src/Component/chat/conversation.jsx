import { useEffect, useState } from "react";
import { socket } from "../../utils/socket.js";
import Chat from "./chat.jsx";
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
          chat._id === updatedConversation._id
            ? { ...chat, ...updatedConversation }
            : chat
        );

        // Move updated conversation to the top
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
    navigate(`/conversation/${id}`);
  };

  return (
    <div className="w-full h-screen flex">
      {/* Left Side: Conversation List */}
      <div className="w-1/3 bg-white h-full overflow-y-auto border-r">
        <div className="p-4 border-b bg-green-500 text-white flex justify-center">
          <h1 className="text-xl font-semibold">Conversations</h1>
        </div>
        <div className="divide-y">
          {conversations.map((chat) => {
            const currentUserId = localStorage.getItem("id");
            const hasLastMessage = !!chat.lastMessage;

            // Fallback conditions for missing lastMessage properties
            const lastMessageContent = hasLastMessage
              ? chat.lastMessage.content || "No message content"
              : "No messages yet";

            const timeStamp = hasLastMessage
              ? chat.lastMessage.timestamp || chat.updatedAt
              : chat.updatedAt;

            const sender = hasLastMessage ? chat.lastMessage.sender || "Unknown" : "Unknown";

            const isSeen =
              hasLastMessage &&
              Array.isArray(chat.lastMessage.seen) &&
              chat.lastMessage.seen.includes(currentUserId);

            return (
              <div
                key={chat._id}
                className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${conversationId === chat._id ? "bg-gray-200" : ""
                  }`}
                onClick={() => handleConversationClick(chat._id)}
              >
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  <span className="text-xl text-gray-600">
                    {chat.participant?.fullName?.[0] || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium truncate">
                      {chat.participant?.fullName || "Unknown User"}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {formatTime(timeStamp)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <p
                      className={`text-sm truncate ${isSeen ? "text-gray-500" : "text-gray-900 font-medium"
                        }`}
                    >
                      {lastMessageContent}
                    </p>
                    {!isSeen && hasLastMessage && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side: Chat */}
      <div className="w-2/3 h-full">
        {conversationId ? (
          <Chat conversationId={conversationId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;
