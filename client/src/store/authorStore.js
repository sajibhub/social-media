import {create} from "zustand";
import axios from "axios";

const Base_url = "https://matrix-media.up.railway.app/api/v1/"
const Sign_up_api = Base_url + "user/auth/signup"
const Login_api = Base_url + "user/auth/login";
const SignOut_api = Base_url + "user/auth/logout";
const Otp_Request_api = Base_url + "user/auth/forger/password/";
const password_Request_api = Base_url + "user/auth/forger/password";

const Read_Profile_api = Base_url + "user/profile/";
const Profile_Update_api = Base_url + "user/profile/pic/update";
const Profile_info_update_api = Base_url + "user/profile/info/update"

const Follow_api = Base_url + "user/profile/follow/";
const Suggest_user_api = Base_url + "user/suggest";
const Search_user_api = Base_url + "user/search";
const follower_list_api = Base_url + "user/followers/";
const following_list_api = Base_url + "user/following/";
const image_Gallery_api = Base_url + "user/profile/post/images/";




const authorStore = create((set) => ({

    signUpFrom: [],
    setSignUpFrom: (name,value)=> {
        set((state) => ({
            signUpFrom: {
                ...state.signUpFrom, [name]: value
            }
        }))
    },

    signUpReq : async (data)=>{

        try {
            await  axios.post(Sign_up_api, data )
            return true
        }
        catch {
            return false
        }

    },


    loginForm: "",
    setLoginForm: (name,value)=>{
        set((state)=>({
            loginForm:{
                ...state.loginForm , [name]:value
            }
        }))
    },


    loginReq : async (data)=>{
        try {
            let res = await axios.post(Login_api, data , {withCredentials: true})
            return res.status
        }
        catch (err){
            return err
        }
    },

    SignOutReq : async ()=>{
        try {
            await axios.post(SignOut_api, "", {withCredentials: true})
            return true
        }
        catch {
            return false
        }
    },

    otpSentData : null,
    setOtpSentData:(name,value)=>{
        set((state)=>({
            otpSentData:{
                ...state.otpSentData , [name]:value
            }
        }))
    },

    otpReq : async (data)=>{
        try {
            await axios.post( Otp_Request_api+ data , " ", {withCredentials: true})
            return true
        }
        catch {
            return false
        }
    },

    passwordReq : async (data)=>{
        try {
            await axios.put( password_Request_api , data, {withCredentials: true})
            return true
        }
        catch {
            return false
        }

    },


    profileData: null,
    clear_profileData : ()=>{
        set({profileData : null})
    },

    myProfileData: null,
    updateProfileData: (name,value)=>{
        set((state)=>({
            myProfileData:{
                ...state.myProfileData , [name]:value
            }
        }))
    },

    updateProfileReq : async (data)=>{
        try {
            await axios.put(Profile_info_update_api, data , {withCredentials:true});
            return true
        } 
        catch  {
            return true
        }
    },

    readProfileReq : async (user)=>{
        try {
            let res =  await axios.get(Read_Profile_api +user,  {withCredentials: true})
            set({profileData: res.data.profile[0]})


            let me =  await axios.get(Read_Profile_api +"me",  {withCredentials: true})
            set({myProfileData: me.data.profile[0]})
            localStorage.setItem('userName', me.data.profile[0].username);

            return true
        }
        catch{
            return false
        }
    },

    profileUpdateData: null,
    setProfileUpdateData: (name,value)=>{
        set((state)=>({
            profileUpdateData:{
                ...state.profileUpdateData , [name]:value
            }
    
        }))
    },
    updateProfileRuq:async(cover, profile)=>{

        let formData = new FormData();
        formData.append("profile", profile);
        formData.append("cover", cover);

        try {
            await axios.put(Profile_Update_api, formData, {withCredentials: true})
            return true
        }
        catch{
            return false
        }

    } ,
        

    flowReq : async (id)=>{
        try {
            await axios.put(Follow_api + id, " " ,{withCredentials: true})
            return true
        }
        catch{
            return false
        }
    },


    suggestUser : null,
    clear_suggestUser : ()=>{
        set({suggestUser : null})
    },
    update_suggestUser : (id, updatedFields) => {
        set((state) => ({
            suggestUser: state. suggestUser.map((item) =>
                item._id === id ? { ...item, ...updatedFields } : item
            ),
        }));
    },

    suggestUserReq : async ()=>{
        try {
           const res =  await axios.get(Suggest_user_api, {withCredentials: true})
            set({suggestUser: res.data})
            return true
        }
        catch{
            return false
        }
    },

    searchKeywords : null,
    setSearchKeywords : (e)=>{
        set({searchKeywords : e})
    },
    searchUserData : null ,
    searchUserReq : async (data)=>{

        const body = {
            search : data
        }
        try{
            const res =  await axios.post(Search_user_api , body, {withCredentials: true})
            set({searchUserData: res.data.searchUser})
            return true
        }
        catch{
            return false
        }

    },

    followersList: null,
    clear_followersList : ()=>{
        set({followersList : null})
    },

    update_followersList : (id, updatedFields) => {
        set((state) => ({
            followersList: state. followersList.map((item) =>
                item._id === id ? { ...item, ...updatedFields } : item
            ),
        }));
    },

    followersReq : async (data)=>{
        try{
            const res =  await axios.get(follower_list_api + data, {withCredentials: true})
            set({followersList: res.data.followers})
            return true
        }
        catch{
            return false
        }
    },

    followingList: null,
    clear_followingList : ()=>{
        set({followingList : null})
    },
    followingListReq : async (data)=>{
        try{
            const res =  await axios.get(following_list_api + data, {withCredentials: true})
            set({followingList: res.data.following})
            return true
        }
        catch{
            return false
        }
    },

    imageGallery: null,
    clear_imageGallery : ()=>{
        set({imageGallery : null})
    },
    imageGalleryReq : async (user)=>{
        try{
            const res =  await axios.get(image_Gallery_api + user , {withCredentials: true})
            set({imageGallery: res.data.images})
            return true
        }
        catch{
            return false
        }
    }

}))

export default authorStore;
