import {create} from "zustand";
import axios from "axios";



const Base_url = "https://matrix-media.up.railway.app/api/v1/"
const Sign_up_api = Base_url + "user/auth/signup"
const Login_api = Base_url + "user/auth/login";
const SignOut_api = Base_url + "user/auth/logout";
const Read_Profile_api = Base_url + "user/profile/";

const Follow_api = Base_url + "user/profile/follow/";




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
            await axios.post(Login_api, data , {withCredentials: true})
            return true
        }
        catch{
            return false
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


    profileData: null,
    myProfileData: null,

    readProfileReq : async (user)=>{
        try {
            let res =  await axios.get(Read_Profile_api +user,  {withCredentials: true})
            set({profileData: res.data.profile[0]})


            let me =  await axios.get(Read_Profile_api +"me",  {withCredentials: true})
            set({myProfileData: me.data.profile[0]})

            return true
        }
        catch{
            return false
        }
    },
    flowReq : async (id)=>{
        try {
            await axios.put(Follow_api + id, " " ,{withCredentials: true})
            return true
        }
        catch{
            return false
        }
    }


}))

export default authorStore;
