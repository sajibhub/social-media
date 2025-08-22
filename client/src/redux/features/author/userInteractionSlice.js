import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API } from "./authorAPI";

// Suggested users
export const fetchSuggestedUsers = createAsyncThunk(
  "userInteraction/fetchSuggestedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API.SUGGEST_USER, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Followers & Following
export const fetchFollowers = createAsyncThunk(
  "userInteraction/fetchFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API.FOLLOWERS_LIST}${userId}`, { withCredentials: true });
      return res.data.followers;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "userInteraction/fetchFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API.FOLLOWING_LIST}${userId}`, { withCredentials: true });
      return res.data.following;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  suggestedUsers: [],
  followers: [],
  following: [],
  status: "idle",
  error: null,
};

const userInteractionSlice = createSlice({
  name: "userInteraction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => { state.suggestedUsers = action.payload; })
      .addCase(fetchFollowers.fulfilled, (state, action) => { state.followers = action.payload; })
      .addCase(fetchFollowing.fulfilled, (state, action) => { state.following = action.payload; });
  },
});

export default userInteractionSlice.reducer;
