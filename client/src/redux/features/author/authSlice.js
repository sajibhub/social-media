import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API } from "./authorAPI";

// Signup
export const signUp = createAsyncThunk("auth/signUp", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API.SIGN_UP, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Login
export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API.LOGIN, data, { withCredentials: true });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  await axios.post(API.SIGN_OUT, {}, { withCredentials: true });
});

const initialState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => { state.status = "loading"; })
      .addCase(signUp.fulfilled, (state, action) => { state.status = "succeeded"; })
      .addCase(signUp.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(login.pending, (state) => { state.status = "loading"; })
      .addCase(login.fulfilled, (state, action) => { state.status = "succeeded"; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })

      .addCase(logout.fulfilled, (state) => { state.user = null; });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
