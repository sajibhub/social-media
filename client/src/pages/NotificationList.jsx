import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaEllipsisH, FaTrashAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // For "Clear All" confirmation dialog
  const url = "https://matrix-media.up.railway.app/api/v1";

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/user/notification/get`, {
        withCredentials: true,
      });
      setNotifications(response.data.notification);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    setShowConfirmDelete(false);
    try {
      const response = await axios.delete(
        `${url}/user/notification/all/clear`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("All notifications deleted successfully");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      setOpenDropdown(null);
      const response = await axios.put(
        `${url}/user/notification/read/${id}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        `${url}/user/notification/all/read`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("All notifications marked as read");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await axios.delete(
        `${url}/user/notification/clear/${id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Notification deleted successfully");
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setOpenDropdown(null);
    if (notification.type === "follow") {
      navigate(`/profile/${notification.user.username}`);
    } else if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {
      navigate(`/post/${notification.postId}`);
    } else {
      console.warn("Unknown notification type:", notification.type);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  return (
    <>
      <div className="relative w-full max-w-[770px] bg-white rounded-lg shadow-lg overflow-hidden h-full pb-11 scroll-smooth">
        <div className="flex justify-between px-4 py-2 border-b">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-xs text-red-500 border border-red-500 rounded hover:bg-red-100 focus:outline-none"
              onClick={() => setShowConfirmDelete(true)}
            >
              Clear All
            </button>

            <button
              className="px-3 py-1 text-xs text-blue-500 border border-blue-500 rounded hover:bg-blue-100 focus:outline-none"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          </div>
        </div>

        <div className="max-h-full overflow-auto scroll-smooth">
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 border-b bg-gray-200 animate-pulse"
                >
                  <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="w-1/2 bg-gray-300 h-4 mb-2"></div>
                    <div className="w-3/4 bg-gray-300 h-3"></div>
                  </div>
                  <div className="w-20 bg-gray-300 h-3"></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => {
                  handleNotificationClick(notification);
                }}
                className={`flex items-center p-4 border-b last:border-b-0 ${
                  notification.isRead ? "bg-white" : "bg-blue-100"
                } ${notification.isRead ? "hover:bg-green-50" : ""} mb-2 -z-30`}
              >
                <img
                  src={notification.user.profile}
                  alt={notification.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4 flex-1 ">
                  <div className="flex text-lg font-medium text-gray-800 items-center gap-1">
                    {notification.user.fullName}{" "}
                    {notification.user.verify && (
                      <MdVerified className="text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {renderNotificationMessage(notification)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{notification.time}</div>

                <div className="relative ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(notification._id);
                    }}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <FaEllipsisH className="w-5 h-5" />
                  </button>

                  {openDropdown === notification._id && (
                    <div className="absolute right-0 -top-8 mt-2 w-48 bg-white border rounded-lg shadow-lg z-100">
                      <button
                        className="block w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                      >
                        <FaTrashAlt className="w-4 h-4 inline mr-2" />
                        Delete
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-sm text-blue-500 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Are you sure you want to delete all notifications?
                </h3>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleClearAllNotifications}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationList;
