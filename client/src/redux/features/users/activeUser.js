// store/features/activeUsersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const activeUsersSlice = createSlice({
  name: "activeUsers",
  initialState: [],
  reducers: {
    setActiveUsers: (state, action) => action.payload,
    addActiveUser: (state, action) => {
      if (!state.includes(action.payload)) state.push(action.payload);
    },
    removeActiveUser: (state, action) =>
      state.filter((id) => id !== action.payload),
  },
});

export const { setActiveUsers, addActiveUser, removeActiveUser } = activeUsersSlice.actions;
export default activeUsersSlice.reducer;
