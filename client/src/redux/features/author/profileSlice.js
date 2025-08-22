import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API } from "./authorAPI";

// Read profile
export const readProfile = createAsyncThunk(
  "profile/readProfile",
  async (username, { rejectWithValue }) => {
    try {
      const url = username === "me" ? API.PROFILE_READ + "me" : API.PROFILE_READ + username;
      const res = await axios.get(url, { withCredentials: true });
      return { username, profile: res.data.profile };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update profile info
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.put(API.PROFILE_INFO_UPDATE, data, { withCredentials: true });
      return res.data.profile;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  myProfile: null,
  otherProfile: null,
  status: "idle",
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateProfileField: (state, action) => {
      const { field, value, isMe } = action.payload;
      if (isMe && state.myProfile) state.myProfile[field] = value;
      else if (!isMe && state.otherProfile) state.otherProfile[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(readProfile.pending, (state) => { state.status = "loading"; })
      .addCase(readProfile.fulfilled, (state, action) => {
        console.log("ok")
        state.status = "succeeded";
        action.payload.myProfile
          ? state.myProfile = action.payload.profile : state.otherProfile = action.payload.profile;
      })
      .addCase(readProfile.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      });
  },
});

export const { updateProfileField } = profileSlice.actions;
export default profileSlice.reducer;
