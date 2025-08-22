// src/components/NotificationList.js
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH, FaTrashAlt } from "react-icons/fa";
import VerifiedBadge from "../Component/utility/VerifyBadge";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../redux/features/notification/notifications.js";

const NotificationList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [markingReadId, setMarkingReadId] = useState(null);

  const { notifications, loading } = useSelector((state) => state.notifications);

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch notifications
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleNotificationClick = (notification) => {
    dispatch(markAsRead(notification._id));
    setOpenDropdown(null);
    if (notification.type === "follow") {
      navigate(`/profile/${notification.user.username}`);
    } else if (notification.type === "like" || notification.type === "comment") {
      navigate(`/post/${notification.postId}`);
    }
  };

  const handleDeleteNotification = async (id) => {
    setDeletingId(id);
    await dispatch(deleteNotification(id));
    setDeletingId(null);
    setOpenDropdown(null);
  };

  const handleMarkAsRead = async (id) => {
    setMarkingReadId(id);
    await dispatch(markAsRead(id));
    setMarkingReadId(null);
    setOpenDropdown(null);
  };

  const renderNotificationMessage = (notification) => {
    switch (notification.type) {
      case "like": return "liked your post";
      case "comment": return "commented on your post";
      case "follow": return "started following you";
      default: return "";
    }
  };

  const themeClass = darkMode
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";

  const notificationClass = (isRead) => darkMode
    ? isRead ? "bg-gray-800/30 hover:bg-gray-700/50" : "bg-blue-900/30 hover:bg-blue-800/50"
    : isRead ? "bg-white hover:bg-gray-100" : "bg-blue-100 hover:bg-blue-200";

  const dropdownClass = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const modalClass = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  return (
    <motion.div className={`relative w-full max-w-[770px] rounded-lg shadow-lg overflow-hidden h-full pb-11 scroll-smooth ${themeClass} font-sans`}>
      <div className={`flex justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="flex space-x-2 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-xs text-red-500 border border-red-500 rounded hover:bg-red-100 focus:outline-none transition-colors"
            onClick={() => dispatch(clearAllNotifications())}
          >
            Clear All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-xs text-blue-500 border border-blue-500 rounded hover:bg-blue-100 focus:outline-none transition-colors"
            onClick={() => dispatch(markAllAsRead())}
          >
            Mark All as Read
          </motion.button>
        </div>
      </div>

      <div className="max-h-full overflow-auto scroll-smooth">
        {loading ? (
          <div className="space-y-4 p-4">
            {[...Array(10)].map((_, i) => (
              <motion.div key={i} className={`flex items-center p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-100'} animate-pulse`}></motion.div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div className="text-center p-8">
            <div className="text-5xl mb-4">🔔</div>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div key={notification._id} onClick={() => handleNotificationClick(notification)}
              className={`flex items-center p-4 border-b cursor-pointer transition-all duration-200 ${notificationClass(notification.isRead)} mb-2`}>
              <img src={notification.user.profile} alt={notification.user.username} className="w-12 h-12 rounded-full object-cover" />
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-1 text-lg font-medium">
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{notification.user.fullName}</span>
                  <VerifiedBadge isVerified={notification.user.verify} />
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {renderNotificationMessage(notification)}
                </div>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{notification.time}</div>
              <div className="relative ml-4" ref={dropdownRef}>
                <motion.button onClick={(e) => { e.stopPropagation(); toggleDropdown(notification._id); }} className="p-2 rounded-full focus:outline-none">
                  <FaEllipsisH className="w-4 h-4" />
                </motion.button>
                <AnimatePresence>
                  {openDropdown === notification._id && (
                    <motion.div className={`absolute right-0 mt-2 w-48 ${dropdownClass} border rounded-lg shadow-lg z-50`}>
                      <button className="block w-full px-4 py-2 text-red-500 hover:bg-red-100 flex items-center"
                        onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification._id); }}>
                        <FaTrashAlt className="mr-2 w-4 h-4" /> Delete
                      </button>
                      <button className="block w-full px-4 py-2 text-blue-500 hover:bg-blue-100 flex items-center"
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}>
                        Mark as Read
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default NotificationList;
