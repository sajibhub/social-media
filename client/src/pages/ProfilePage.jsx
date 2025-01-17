import Layout from "@/layout/Layout.jsx";
import UserInfo from "@/Component/users/UserInfo.jsx";
import postStore from "@/store/postStore.js";
import {useEffect} from "react";
import PostCard from "@/Component/post/PostCard.jsx";
import authorStore from "@/store/authorStore.js";


const ProfilePage = () => {
    const {myPostReq} = postStore()
    const {readProfileReq}= authorStore()

    useEffect(() => {
        (
            async ()=>{
                  await myPostReq();
                  await readProfileReq("me")
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