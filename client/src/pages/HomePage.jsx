import Layout from "../layout/Layout.jsx";
import StoryComponent from "../Component/story/StoryComponent.jsx";
import AddPost from "../Component/post/AddPost.jsx";
import PostCard from "../Component/post/PostCard.jsx";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import authorStore from "@/store/authorStore.js";


const HomePage = () => {

    const{readProfileReq}= authorStore()
    const navigate = useNavigate();

    useEffect(() => {

        (

            async ()=>{
                let res = await readProfileReq("me")
                if(res !== true){
                    navigate('/author')
                }
            }
        )()

    }, []);

    return (
        <Layout>
            <div className="flex flex-row items-center border-b-2 sticky top-0 bg-blur bg-white bg-opacity-20 z-[999999] ">
                <button className="flex-grow py-4 text-lg font-medium  text-neutral-800 hover:bg-sky-50 ">
                    Fore You
                </button>

                <button className="flex-grow py-4 text-lg font-medium text-neutral-600 hover:bg-sky-50 ">
                    Following
                </button>
            </div>

            <StoryComponent />
            <AddPost />
            <PostCard />

        </Layout>
    );
};

export default HomePage;