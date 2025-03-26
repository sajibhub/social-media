import {create} from "zustand";
import axios from "axios";

const Base_url = `${import.meta.env.VITE_API_URL}/api/v1/`;
const Story_Api= Base_url + "user/story/read";
const Create_Story_Api = Base_url + "user/story/create";

const StoryStore  = create((set) => ({

    StoryData : null,
    clearStoreData: ()=>{
        set({StoryData : null})
    },
    StoryReq: async ()=>{
        try{
            const res = await axios.get( Story_Api, {withCredentials:true} );
            set({StoryData :res.data.stories})
            return true
        }
        catch {
            return false;
        }
    },

    createStoryReq: async (image, text)=>{

        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("text", text);
            const res = await axios.post( Create_Story_Api, formData, {withCredentials:true} );
            return res.status
        }
        catch (error) {
            return error.response.data;

        }
    }


}))

export default StoryStore;