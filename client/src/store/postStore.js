import {create} from "zustand";
import axios from "axios";


const Base_url = "https://matrix-media.up.railway.app/api/v1/"
const Create_Post_Api= Base_url + "user/post/create";
const My_Post_Api= Base_url + "/user/post/read";
const Update_Post_Api= Base_url + "user/post/update/";
const Delete_Post_Api= Base_url + "user/post/delete/";
const Like_Post_Api= Base_url + "user/post/like/";
const Comment_Post_Api= Base_url + "user/post/comment/";

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

    },

    my_post_data:null,
    myPostReq : async ()=>{
        try{
            const res = await axios.get( My_Post_Api ,  {withCredentials:true} );
            if(res.status === 200){
                set({my_post_data : res.data.post});
            }

            return true
        }
        catch {
            return false;

        }
    },

    updatePostData :null,
    clearUpdatePostData : (e)=>{
        set({updatePostData:e})
    },
    setUpdatePostData : (name,value)=>{
        set((state)=>({
            updatePostData:{
                ...state.updatePostData , [name]:value
            }
        }))
    },

    updatePostReq : async (data)=>{
        const id = data.id;
        let Data ={
            "caption": data.caption
        };

            try{
               await axios.put( Update_Post_Api + id ,Data, {withCredentials:true} );
               return true
            }
            catch {
                return false;
            }
    },
    deletePostReq : async (id)=>{
        try {
            await axios.delete( Delete_Post_Api + id, {withCredentials:true} );
            return true
        }
        catch {
            return false;
        }
    },
    likePostReq : async (id)=>{
        try {
            await axios.put( Like_Post_Api + id," ",{withCredentials:true} );
            return true
        }
        catch {
            return false;
        }
    },
    commentPostData: null,
    clearCommentPostData : (e)=>{
        set({commentPostData : e})
    },
    setCommentPostData: (name,value)=>{
        set((state)=>({
            commentPostData:{
                ...state.commentPostData , [name]:value
            }
        }))
    },

    commentPostReq : async (data)=>{
        const id = data.id;
        let Data ={
            "comment": data.comment,
        }
        try {
            await axios.put( Comment_Post_Api + id,Data,{withCredentials:true} );
            return true
        }
        catch {
            return false;
        }
    }



}))


export default postStore;