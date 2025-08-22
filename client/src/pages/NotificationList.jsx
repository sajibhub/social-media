// src/components/NotificationList.js
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH, FaTrashAlt, FaSun, FaMoon } from "react-icons/fa";
import VerifiedBadge from "../Component/utility/VerifyBadge";
import notificationStore from "../store/notificationStore";

const NotificationList = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [markingReadId, setMarkingReadId] = useState(null);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    loading,
    showConfirmDelete,
    fetchNotifications,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleConfirmDelete,
  } = notificationStore();

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (savedTheme === "light") {
      setDarkMode(false);
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setOpenDropdown(null);
    if (notification.type === "follow") {
      navigate(`/profile/${notification.user.username}`);
    } else if (notification.type === "like" || notification.type === "comment") {
      navigate(`/post/${notification.postId}`);
    } else {
      console.warn("Unknown notification type:", notification.type);
    }
  };

  const handleDeleteNotification = async (id) => {
    setDeletingId(id);
    await deleteNotification(id);
    setDeletingId(null);
    setOpenDropdown(null);
  };

  const handleMarkAsRead = async (id) => {
    setMarkingReadId(id);
    await markAsRead(id);
    setMarkingReadId(null);
    setOpenDropdown(null);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderNotificationMessage = (notification) => {
    switch (notification.type) {
      case "like":
        return `liked your post`;
      case "comment":
        return `commented on your post`;
      case "follow":
        return `started following you`;
      default:
        return "";
    }
  };

  // Theme classes
  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";
  

  const notificationClass = (isRead) => darkMode 
    ? isRead ? "bg-gray-800/30 hover:bg-gray-700/50" : "bg-blue-900/30 hover:bg-blue-800/50"
    : isRead ? "bg-white hover:bg-gray-100" : "bg-blue-100 hover:bg-blue-200";
  
  const dropdownClass = darkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-200";
  
  const modalClass = darkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-200";

  return (
    <motion.div 
      className={`relative w-full max-w-[770px] rounded-lg shadow-lg overflow-hidden h-full pb-11 scroll-smooth ${themeClass} font-sans`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="flex space-x-2 items-center">
         
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-xs text-red-500 border border-red-500 rounded hover:bg-red-100 focus:outline-none transition-colors"
            onClick={toggleConfirmDelete}
          >
            Clear All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-xs text-blue-500 border border-blue-500 rounded hover:bg-blue-100 focus:outline-none transition-colors"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </motion.button>
        </div>
      </div>
      
      <div className="max-h-full overflow-auto scroll-smooth">
        {loading ? (
          <div className="space-y-4 p-4">
            {[...Array(10)].map((_, index) => (
              <motion.div
                key={index}
                className={`flex items-center p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-100'} animate-pulse`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="w-1/2 bg-gray-300 h-4 mb-2"></div>
                  <div className="w-3/4 bg-gray-300 h-3"></div>
                </div>
                <div className="w-20 bg-gray-300 h-3"></div>
              </motion.div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            className="text-center p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-5xl mb-4">🔔</div>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              You're all caught up!
            </p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-center p-4 border-b last:border-b-0 cursor-pointer transition-all duration-200 ${notificationClass(notification.isRead)} ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-2`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.img
                src={notification.user.profile}
                alt={notification.user.username}
                className="w-12 h-12 rounded-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
              <div className="ml-4 flex-1">
                <div className="flex text-lg font-medium items-center gap-1">
                  <span className={`cursor-pointer hover:underline ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {notification.user.fullName}
                  </span>
                  <VerifiedBadge isVerified={notification.user.verify} />
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {renderNotificationMessage(notification)}
                </div>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {notification.time}
              </div>
              <div className="relative ml-4" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(notification._id);
                  }}
                  className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} focus:outline-none transition-colors`}
                >
                  <FaEllipsisH className="w-4 h-4" />
                </motion.button>
                
                <AnimatePresence>
                  {openDropdown === notification._id && (
                    <motion.div
                      className={`absolute right-0 -top-8 mt-2 w-48 ${dropdownClass} border rounded-lg shadow-lg z-100`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.button
                        className="block w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100 flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                        whileHover={{ x: 5 }}
                        disabled={deletingId === notification._id}
                      >
                        {deletingId === notification._id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FaTrashAlt className="w-4 h-4 inline mr-2" />
                            Delete
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        className="block w-full px-4 py-2 text-sm text-blue-500 hover:bg-blue-100 flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        whileHover={{ x: 5 }}
                        disabled={markingReadId === notification._id}
                      >
                        {markingReadId === notification._id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Marking as Read...
                          </>
                        ) : (
                          "Mark as Read"
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
        
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={`${modalClass} p-6 rounded-lg shadow-xl w-full max-w-md border`}
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                  Are you sure you want to delete all notifications?
                </h3>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                    onClick={toggleConfirmDelete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={clearAllNotifications}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Yes, Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationList;