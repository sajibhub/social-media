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


    readProfileReq : async (data)=>{

        try {

            await axios.post(Read_Profile_api, data , {withCredentials: true})

            return true
        }
        catch{
            return false
        }

    }
}))

export default authorStore;
