import { configureStore } from '@reduxjs/toolkit';
// import notificationReducer from './features/notificationSlice';
import activeUsersReducer from '../features/users/activeUser.js';
// import profileReducer from './features/profileSlice';

export const store = configureStore({
  reducer: {
    // notifications: notificationReducer,
    activeUsers: activeUsersReducer
    // profile: profileReducer,
  },
});
