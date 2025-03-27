import Conversation from "../Component/chat/conversation";
import Chat from "../Component/chat/chat.jsx";
import { useParams } from "react-router-dom";

const Message = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex w-full h-screen">
      <Conversation />
      <div className="w-full md:w-2/3 h-full">
        {conversationId ? (
          <Chat />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm md:text-base">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;