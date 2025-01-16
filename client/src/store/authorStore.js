import {create} from "zustand";
import axios from "axios";



const Base_url = "https://matrix-media.up.railway.app/api/v1/"
const Login_api = Base_url + "user/auth/login";
const Read_Profile_api = Base_url + "user/profile/username";




const authorStore = create((set) => ({
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

    profileData: null,

    readProfileReq : async ()=>{
        try {
           let res =  await axios.get(Read_Profile_api,  {withCredentials: true})
            set({profileData: res.data.profile[0]})
            return true
        }
        catch{
            return false
        }

    }
}))

export default authorStore;
