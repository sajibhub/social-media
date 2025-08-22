// store/features/activeUsersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const activeUsersSlice = createSlice({
  name: "activeUsers",
  initialState: {
    activeUsers: [],
  },
  reducers: {
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    addActiveUser: (state, action) => {
      if (!state.activeUsers.includes(action.payload)) {
        state.activeUsers.push(action.payload);
      }
    },
    removeActiveUser: (state, action) => {
      state.activeUsers = state.activeUsers.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const { setActiveUsers, addActiveUser, removeActiveUser } =
  activeUsersSlice.actions;
export default activeUsersSlice.reducer;
