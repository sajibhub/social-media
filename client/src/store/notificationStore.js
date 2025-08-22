// src/store/notificationStore.js
import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const notificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  showConfirmDelete: false,

  // Fetch notifications
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/user/notification/get`, {
        withCredentials: true,
      });
      set({ notifications: response.data.notification });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      set({ loading: false });
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    set({ showConfirmDelete: false });
    try {
      const response = await axios.delete(`${API_URL}/user/notification/all/clear`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success("All notifications deleted successfully");
        // updateProfileDataField('notification',0)
        set({ notifications: [] });
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/user/notification/read/${id}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          ),
        }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await axios.put(
        `${API_URL}/user/notification/all/read`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("All notifications marked as read");
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
        }));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  },

  // Delete single notification
  deleteNotification: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/user/notification/clear/${id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Notification deleted successfully");
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif._id !== id),
        }));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  },

  // Toggle confirm delete dialog
  toggleConfirmDelete: () => {
    set((state) => ({ showConfirmDelete: !state.showConfirmDelete }));
  },

  // Add new notification from socket
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },
}));


export default notificationStore;