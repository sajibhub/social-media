import Layout from "@/layout/Layout.jsx";
import UserInfo from "@/Component/users/UserInfo.jsx";
import postStore from "@/store/postStore.js";
import {useEffect} from "react";
import PostCard from "@/Component/post/PostCard.jsx";


const ProfilePage = () => {
    const {myPostReq} = postStore()

    useEffect(() => {
        (
            async ()=>{
                  await myPostReq();
            }
        )()
    }, []);

    return (
        <Layout>
            <UserInfo />
            <PostCard />

        </Layout>
    );
};

export default ProfilePage;