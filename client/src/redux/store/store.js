import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from '../features/notification/notifications.js';
import activeUsersReducer from '../features/users/activeUser.js';
import authReducer from '../features/author/authSlice.js';
import profileReducer from '../features/author/profileSlice.js';
import userInteractionReducer from '../features/author/userInteractionSlice.js';
// import profileReducer from './features/profileSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    activeUsers: activeUsersReducer,
    auth: authReducer,
    profile: profileReducer,
    userInteraction: userInteractionReducer,
    // profile: profileReducer,
  },
});
