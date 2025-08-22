// redux/features/notifications/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    "notifications/fetch",
    async () => {
        const res = await axios.get(`${API_URL}/user/notification/get`, { withCredentials: true });
        return res.data.notification;
    }
);

// Mark as read
export const markAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (id) => {
        await axios.put(`${API_URL}/user/notification/read/${id}`, {}, { withCredentials: true });
        return id; // <--- return the ID so reducer has payload
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
    "notifications/delete",
    async (id) => {
        await axios.delete(`${API_URL}/user/notification/clear/${id}`, { withCredentials: true });
        return id; // <--- return the ID
    }
);

// Clear all notifications
export const clearAllNotifications = createAsyncThunk(
    "notifications/clearAll",
    async () => {
        await axios.delete(`${API_URL}/user/notification/all/clear`, { withCredentials: true });
        return; // no payload needed
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async () => {
        await axios.put(`${API_URL}/user/notification/all/read`, {}, { withCredentials: true });
        return; // no payload needed
    }
);

const initialState = {
    notifications: [],
    loading: false,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload); 
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
                state.loading = false;
            })
            .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })

            .addCase(markAsRead.fulfilled, (state, action) => {
                const id = action.payload;
                state.notifications = state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                );
            })

            .addCase(deleteNotification.fulfilled, (state, action) => {
                const id = action.payload;
                state.notifications = state.notifications.filter((n) => n._id !== id);
            })

            .addCase(clearAllNotifications.fulfilled, (state) => {
                state.notifications = [];
            })

            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
            });
    },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
