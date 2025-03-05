import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import authorStore from "../../store/authorStore.js"

const ChatContainer = () => {

  const { myProfileData } = authorStore();


  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const userId = myProfileData._id;

  useEffect(() => {
    const newSocket = io('https://matrix-social-media-backend.onrender.com', {
      query: { id: userId }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('getConversations');
    });

    newSocket.on('conversations', (data) => {
      setConversations(data);
    });

    newSocket.on('newMessage', (message) => {
      if (selectedConversation?.conversationId === message.conversationId) {
        setMessages(prev => [...prev, message]);
      }
      newSocket.emit('getConversations');
    });

    newSocket.on('chatHistory', ({ messages: history }) => {
      setMessages(history);
    });

    newSocket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    newSocket.on('messagesRead', ({ conversationId, readAt }) => {
      if (selectedConversation?.conversationId === conversationId) {
        setMessages(prev => prev.map(msg =>
          msg.isRead ? msg : { ...msg, isRead: true, readAt }
        ));
      }
    });

    newSocket.on('error', ({ message }) => {
      console.error(message);
    });

    return () => newSocket.disconnect();
  }, [userId]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    socket.emit('getChatHistory', { contactId: conversation.contactId });
    socket.emit('markAsRead', { conversationId: conversation.conversationId });
  };

  const sendMessage = (text, image) => {
    if (!selectedConversation || !socket) return;

    // Optimistic UI: Add message to the UI before server response
    const newMessage = {
      _id: Date.now(), // Temporary ID
      sender: userId,
      receiver: selectedConversation.contactId,
      text,
      image,
      time: new Date(),
      conversationId: selectedConversation.conversationId,
      isRead: false,
      readAt: null
    };

    setMessages(prev => [...prev, newMessage]);

    const messageData = JSON.stringify({
      receiverId: selectedConversation.contactId,
      text,
      image
    });

    socket.emit('sendPrivateMessage', messageData);

    // After the server confirms, update the message with the actual data
    socket.on('newMessage', (message) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === newMessage._id ? { ...msg, _id: message._id, time: message.time } : msg
        )
      );
    });
  };

  const deleteMessage = (messageId) => {
    socket.emit('deleteMessage', { messageId });
  };

  const ConversationsList = () => {
    return (
      <div className="h-full overflow-y-auto p-5 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-gray-50 py-2">Conversations</h2>
        {conversations.map(conv => (
          <div
            key={conv.conversationId}
            className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-100 ${selectedConversation?.conversationId === conv.conversationId ? 'bg-gray-100' : ''
              }`}
            onClick={() => handleSelectConversation(conv)}
          >
            <div className="flex items-center gap-3">
              <img
                src={conv.profile || '/default-avatar.png'}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium">{conv.fullName}</h3>
                <p className="text-sm text-gray-600">@{conv.username}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500 truncate flex-1">
                {conv.lastMessage.text}
              </p>
              {conv.lastMessage.sender.toString() === userId && (
                <span className="ml-2">
                  {conv.lastMessage.isRead ? (
                    <FaCheckDouble className="text-blue-500" size={12} />
                  ) : (
                    <FaCheck className="text-gray-400" size={12} />
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ChatWindow = () => {
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (messageText.trim()) {
        sendMessage(messageText);
        setMessageText('');
      }
    };

    if (!selectedConversation) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
          <img
            src={selectedConversation.profile || '/default-avatar.png'}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{selectedConversation.fullName}</h2>
            <p className="text-sm text-gray-600">@{selectedConversation.username}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`flex mb-4 ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[60%] p-3 rounded-lg ${msg.sender === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                  }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.image && (
                  <img src={msg.image} alt="attachment" className="max-w-full rounded mt-2" />
                )}
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${msg.sender === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.time).toLocaleTimeString()}
                  </span>
                  {msg.sender === userId && (
                    <div className="flex items-center gap-1 ml-2">
                      {msg.isRead ? (
                        <FaCheckDouble className="text-blue-200" size={12} />
                      ) : (
                        <FaCheck className="text-blue-200" size={12} />
                      )}
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="text-xs text-blue-100 hover:text-white ml-2"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/3 max-w-md border-r border-gray-200">
        <ConversationsList />
      </div>

      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatContainer;
