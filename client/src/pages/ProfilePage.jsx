import Layout from "@/layout/Layout.jsx";
import UserInfo from "@/Component/users/UserInfo.jsx";
import postStore from "@/store/postStore.js";
import {useEffect} from "react";
import PostCard from "@/Component/post/PostCard.jsx";
import authorStore from "@/store/authorStore.js";
import {useParams} from "react-router-dom";
import uiManage from "@/store/uiManage.js";
import FollowersListComponent from "@/Component/users/FollowersListComponent.jsx";
import FollowingListComponent from "@/Component/users/FollowingListComponent.jsx";
import PersonalInfoComponent from "../Component/users/PersonalInfoComponent";
import ImageGallery from "@/Component/users/ImageGallery.jsx";



const ProfilePage = () => {
    const {user} = useParams();
    const {myPostReq, clear_my_post_data} = postStore()
    const {readProfileReq , followersReq ,followingListReq, imageGalleryReq , clear_profileData ,clear_followersList,clear_followingList, clear_imageGallery }= authorStore()
    const {profile_tab} = uiManage()


    useEffect(() => {
        (
            async ()=>{
                clear_my_post_data()
                clear_profileData()
                clear_followersList()
                clear_followingList()
                clear_imageGallery()

                await readProfileReq(user)
                await myPostReq(user);
                await followersReq(user);
                await followingListReq(user);
                await imageGalleryReq(user)
            }
        )()
    }, [user]);


    return (
        <Layout>
            <UserInfo />

            {
                profile_tab === "my-post" && <PostCard/>
            }
            {
                profile_tab === "post-photo" && <ImageGallery />
            }
            {
                profile_tab === "followers" && <FollowersListComponent />
            }
            {
                profile_tab === "following" && <FollowingListComponent />
            }

            {
                profile_tab === "about" && <PersonalInfoComponent />
            }

        </Layout>
    );
};

export default ProfilePage;