import { create } from 'zustand';

// Define the store for managing active users
const useActiveStore = create((set, get) => ({
  activeUsers: [], 

  setActiveUsers: (users) => set({ activeUsers: users }),

  toggleUserStatus: (userId) =>
    set((state) => {
      const isUserOnline = state.activeUsers.includes(userId);
      const newActiveUsers = isUserOnline
        ? state.activeUsers.filter((id) => id !== userId) 
        : [...state.activeUsers, userId];
      return { activeUsers: newActiveUsers };
    }),

  isUserOnline: (userId) => {
    const state = get(); // Access the current state
    return state.activeUsers.includes(userId);
  },
}));

export default useActiveStore;
