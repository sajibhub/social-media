import {create} from "zustand";
import axios from "axios";



const Base_url = "https://matrix-media.up.railway.app/api/v1/"
const Create_Post_Api= Base_url + "user/post/create";
const My_Post_Api= Base_url + "/user/post/read/";
const newsFeed_Post_Api= Base_url + "/user/post/feed";
const Update_Post_Api= Base_url + "user/post/update/";
const Delete_Post_Api= Base_url + "user/post/delete/";
const Like_Post_Api= Base_url + "user/post/like/";
const CommentList_Post_Api= Base_url + "user/post/comment/view/";
const Post_Comment_delete_api= Base_url + "user/post/comment/delete/"
const Post_Comment_Update_api= Base_url + "user/post/comment/update/"
const Comment_Post_Api= Base_url + "user/post/comment/";
const Save_Post_Api= Base_url + "user/post/save/";
const Save_Post_list_Api= Base_url + "user/save/post";


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
    clear_my_post_data : ()=>{
        set({my_post_data : null})
    },

    update_my_post_data : (id, updatedFields) => {
        set((state) => ({
            my_post_data: state. my_post_data.map((item) =>
                item._id === id ? { ...item, ...updatedFields } : item
            ),
        }));
    },

    myPostReq : async (user)=>{
        try{
            const res = await axios.get( My_Post_Api + user ,  {withCredentials:true} );
            if(res.status === 200){
                set({my_post_data : res.data.post});
            }
            return true
        }
        catch {
            return false;

        }
    },

    newsFeedReq : async ()=>{
        try{
            const res = await axios.get( newsFeed_Post_Api ,  {withCredentials:true} );
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

    commentList: null,
    removeCommentList : (e)=>{
        set({commentList:e})
    },
    commentListReq : async (id)=>{
        try {
            const res = await axios.get(CommentList_Post_Api + id , {withCredentials: true})
            set({commentList: res.data.comments})
            return true
        }

        catch {
            return false
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
    },

    deletePostCommentReq: async(postId , id)=>{

        let api = Post_Comment_delete_api + postId + "/" + id;
        try {
            await axios.delete(api, {withCredentials:true} );
            return true
        }
        catch {
            return false;
        }

    },

    updateComment : async (data)=>{
        const PostId = data.id
        const comment = {
            comment: data.comment
        }
        const commentId = data.commentId

        let api = Post_Comment_Update_api + PostId + "/" + commentId;
        
        try {
            await axios.put(api, comment, {withCredentials:true} );
            return true
        } 
        catch {
            return false;
        }


    },

    savePostReq : async (id)=>{
        try {
            await axios.put( Save_Post_Api + id , " ",{withCredentials:true} );
            return true
        }
        catch {
            return false;
        }
    },


    savePostListReq : async ()=>{
        try{
            const res = await axios.get( Save_Post_list_Api, {withCredentials:true} );
            set({my_post_data :res.data.savedPosts})
            return true
        }
        catch {
            return false;
        }
    },

}))


export default postStore;    