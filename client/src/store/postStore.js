import {create} from "zustand";
import axios from "axios";


const Base_url = "https://matrix-media.up.railway.app/api/v1/"
const Create_Post_Api= Base_url + "user/post/create";

const postStore  = create((set) => ({

    createPostReq : async (img, text)=>{
        try {
            const formData = new FormData();
            formData.append("image", img);
            formData.append("caption", text);
            await axios.post( Create_Post_Api , formData , {withCredentials:true} );
            return true
        }
        catch {
            return false;
        }

    }


}))


export default postStore;