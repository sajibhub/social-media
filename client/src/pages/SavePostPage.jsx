import {useEffect} from "react";
import postStore from "@/store/postStore.js";
import Layout from "@/layout/Layout.jsx";
import PostCard from "@/Component/post/PostCard.jsx";


const SavePostPage = () => {
    const {savePostListReq ,clear_my_post_data} = postStore()

    useEffect(() => {
        (
            async ()=>{
                clear_my_post_data()
                 await savePostListReq()
            }
        )()
    }, []);

    return (
        <Layout>
            <div className="w-full border-b-2 sticky top-0 bg-blur bg-white bg-opacity-20 z-[999999]">
                <h1 className=" text-center text-xl font-medium text-neutral-700 py-3">Save Post</h1>
            </div>
            <PostCard />

        </Layout>
    );
};

export default SavePostPage;