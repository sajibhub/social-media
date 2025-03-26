import { create } from 'zustand';
import axios from 'axios';

// Base URLs and API endpoints
const Base_url = `${import.meta.env.VITE_API_URL}/api/v1`;
const Sign_up_api = `${Base_url}user/auth/signup`;
const Login_api = `${Base_url}user/auth/login`;
const SignOut_api = `${Base_url}user/auth/logout`;
const Otp_Request_api = `${Base_url}user/auth/forger/password/`;
const password_Request_api = `${Base_url}user/auth/forger/password`;
const Read_Profile_api = `${Base_url}user/profile/`;
const Profile_Update_api = `${Base_url}user/profile/pic/update`;
const Profile_info_update_api = `${Base_url}user/profile/info/update`;
const Follow_api = `${Base_url}user/profile/follow/`;
const Suggest_user_api = `${Base_url}user/suggest`;
const Search_user_api = `${Base_url}user/search`;
const follower_list_api = `${Base_url}user/followers/`;
const following_list_api = `${Base_url}user/following/`;
const image_Gallery_api = `${Base_url}user/profile/post/images/`;

const authorStore = create((set, get) => ({
  signUpForm: [],
  setSignUpForm: (name, value) => {
    set((state) => ({
      signUpForm: { ...state.signUpForm, [name]: value },
    }));
  },

  signUpReq: async (data) => {
    try {
      const res = await axios.post(Sign_up_api, data);
      return res.status;
    } catch (error) {
      console.error('Error in signUp:', error);
      return false;
    }
  },

  loginForm: '',
  setLoginForm: (name, value) => {
    set((state) => ({
      loginForm: { ...state.loginForm, [name]: value },
    }));
  },

  loginReq: async (data) => {
    try {
      let res = await axios.post(Login_api, data, { withCredentials: true });
      return res.status;
    } catch (err) {
      console.error('Error in login:', err);
      return false;
    }
  },

  SignOutReq: async () => {
    try {
      await axios.post(SignOut_api, '', { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error during sign-out:', error);
      return false;
    }
  },

  otpSentData: null,
  setOtpSentData: (name, value) => {
    set((state) => ({
      otpSentData: { ...state.otpSentData, [name]: value },
    }));
  },

  otpReq: async (data) => {
    try {
      await axios.post(Otp_Request_api + data, '', { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error in OTP request:', error);
      return false;
    }
  },

  passwordReq: async (data) => {
    try {
      await axios.put(password_Request_api, data, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error in password reset:', error);
      return false;
    }
  },

  profileData: null,
  clear_profileData: () => {
    set({ profileData: null });
  },

  myProfileData: null,
  updateProfileData: (name, value) => {
    set((state) => ({
      myProfileData: { ...state.myProfileData, [name]: value },
    }));
  },

  updateProfileReq: async (data) => {
    const existingProfile = get().myProfileData;
    if (existingProfile) {
      data = { ...existingProfile, ...data }; // Merge data if exists locally
    }

    try {
      await axios.put(Profile_info_update_api, data, { withCredentials: true });
      set({ myProfileData: data }); // Update local state after API call
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },

  readProfileReq: async (user) => {
    const profileData = get().profileData;
    const myProfileData = get().myProfileData;
  
    // If profile data exists, no need to call the API, return true
    if (profileData && myProfileData) {
      return true; // Data exists locally, no need to refetch
    }
  
    try {
      let res = await axios.get(Read_Profile_api + user, { withCredentials: true });
      set({ profileData: res.data.profile });
  
      let me = await axios.get(Read_Profile_api + 'me', { withCredentials: true });
      set({ myProfileData: me.data.profile });
  
      localStorage.setItem('userName', me.data.profile.username);
      localStorage.setItem('id', me.data.profile._id);
  
      return true;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return false;
    }
  },
  
  updateProfileDataField: (name, value) => {
    const profileData = get().profileData;
    const myProfileData = get().myProfileData;
  
    if (profileData) {
      set({
        profileData: { ...profileData, [name]: value },
      });
    }
  
    if (myProfileData) {
      set({
        myProfileData: { ...myProfileData, [name]: value },
      });
    }
  },
  

  profileUpdateData: null,
  setProfileUpdateData: (name, value) => {
    set((state) => ({
      profileUpdateData: { ...state.profileUpdateData, [name]: value },
    }));
  },

  updateProfileRuq: async (cover, profile) => {
    let formData = new FormData();
    formData.append('profile', profile);
    formData.append('cover', cover);

    try {
      await axios.put(Profile_Update_api, formData, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error updating profile images:', error);
      return false;
    }
  },

  flowReq: async (id) => {
    try {
      await axios.put(Follow_api + id, '', { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },

  suggestUser: null,
  clear_suggestUser: () => {
    set({ suggestUser: null });
  },

  update_suggestUser: (id, updatedFields) => {
    set((state) => ({
      suggestUser: state.suggestUser.map((item) =>
        item._id === id ? { ...item, ...updatedFields } : item
      ),
    }));
  },

  suggestUserReq: async () => {
    const suggestUser = get().suggestUser;
    if (suggestUser) {
      return suggestUser; // Return if suggestUser exists locally
    }

    try {
      const res = await axios.get(Suggest_user_api, { withCredentials: true });
      set({ suggestUser: res.data });
      return true;
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      return false;
    }
  },

  searchKeywords: null,
  setSearchKeywords: (e) => {
    set({ searchKeywords: e });
  },

  searchUserData: null,
  searchUserReq: async (data) => {
    const searchUserData = get().searchUserData;
    if (searchUserData) {
      return searchUserData; // Return if searchUserData exists locally
    }

    const body = { search: data };
    try {
      const res = await axios.post(Search_user_api, body, { withCredentials: true });
      set({ searchUserData: res.data.searchUser });
      return true;
    } catch (error) {
      console.error('Error searching users:', error);
      return false;
    }
  },

  followersList: null,
  clear_followersList: () => {
    set({ followersList: null });
  },

  update_followersList: (id, updatedFields) => {
    set((state) => ({
      followersList: state.followersList.map((item) =>
        item._id === id ? { ...item, ...updatedFields } : item
      ),
    }));
  },

  followersReq: async (data) => {
    const followersList = get().followersList;
    if (followersList) {
      return followersList; // Return if followersList exists locally
    }

    try {
      const res = await axios.get(follower_list_api + data, { withCredentials: true });
      set({ followersList: res.data.followers });
      return true;
    } catch (error) {
      console.error('Error fetching followers:', error);
      return false;
    }
  },

  followingList: null,
  clear_followingList: () => {
    set({ followingList: null });
  },

  followingListReq: async (data) => {
    const followingList = get().followingList;
    if (followingList) {
      return followingList; 
    }

    try {
      const res = await axios.get(following_list_api + data, { withCredentials: true });
      set({ followingList: res.data.following });
      return true;
    } catch (error) {
      console.error('Error fetching following list:', error);
      return false;
    }
  },

  imageGallery: null,
  clear_imageGallery: () => {
    set({ imageGallery: null });
  },

  imageGalleryReq: async (user) => {
    const imageGallery = get().imageGallery;
    if (imageGallery) {
      return imageGallery; 
    }

    try {
      const res = await axios.get(image_Gallery_api + user, { withCredentials: true });
      set({ imageGallery: res.data.images });
      return true;
    } catch (error) {
      console.error('Error fetching image gallery:', error);
      return false;
    }
  },
}));

export default authorStore;
