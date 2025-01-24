import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaEllipsisH, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const url = "https://matrix-media.up.railway.app/api/v1";

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/user/notification/get`, {
        withCredentials: true,
      });
      setNotifications(response.data.notification);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const MarkAsRead = async (id) => {
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
    } catch (error) {}
  };

  const markAllAsRead = async () => {
    try {
      setOpenDropdown(null);
      const response = await axios.put(
        `${url}/user/notification/all/read`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        fetchNotifications();
      }
    } catch (error) {}
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      const response = await axios.delete(
        `${url}/user/notification/all/clear`,
        { withCredentials: true }
      );
      if (response.status == 200) {
        toast.success("Successfully deleted");
        fetchNotifications();
      }
    } catch (error) {}
  };

  const deleteNotification = async (id) => {
    try {
      setOpenDropdown(null);
      const response = await axios.delete(
        `${url}/user/notification/clear/${id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("notification cleared successfully");
        fetchNotifications();
      }
    } catch (error) {}
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleCancelClick = () => {
    setOpenDropdown(null);
  };

  const userNavigate = (notification) => {
    // if (notification.type == "follow") {
    //   navigate(`/profile/${notification.user.username}`);
    // }
    // if (notification.type == "like") {
    //   navigate(`/post/${notification.postId}`);
    // }
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
      <div className="relative w-full max-w-[770px] bg-white rounded-lg shadow-lg overflow-hidden h-screen">
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

        <div className="max-h-full overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No notifications
            </div>
          ) : loading ? (
            <div className="max-h-full overflow-y-auto">
              <div className="space-y-4">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 border-b last:border-b-0 bg-gray-200 animate-pulse"
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
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => userNavigate(notification)}
                className={`flex items-center p-4 border-b last:border-b-0 ${
                  notification.isRead ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-50`}
              >
                <img
                  onClick={handleCancelClick}
                  src={notification.user.profile}
                  alt={notification.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div onClick={handleCancelClick} className="ml-4 flex-1">
                  <div className="text-lg font-medium text-gray-800">
                    {notification.user.fullName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {renderNotificationMessage(notification)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{notification.time}</div>

                <div className="relative ml-4">
                  <button
                    onClick={() => toggleDropdown(notification._id)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <FaEllipsisH className="w-5 h-5" />
                  </button>

                  {openDropdown === notification._id && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10"
                      style={{
                        top: "0",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <button
                        className="block w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100"
                        onClick={() => deleteNotification(notification._id)}
                      >
                        <FaTrashAlt className="w-4 h-4 inline mr-2" />
                        Delete
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-sm text-blue-500 hover:bg-blue-100"
                        onClick={() => MarkAsRead(notification._id)}
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                  {showConfirmDelete && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20"
                      style={{
                        top: "0",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="flex flex-col">
                        <button
                          className="block w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100"
                          onClick={() => handleConfirmDelete()}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                          onClick={() => setShowConfirmDelete(false)}
                        >
                          No, Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationList;
