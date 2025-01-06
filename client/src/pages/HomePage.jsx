import Layout from "../layout/Layout.jsx";
import HomeStoryComponent from "../Component/home/HomeStoryComponent.jsx";
import AddPost from "../Component/home/AddPost.jsx";
import PostCard from "../Component/home/PostCard.jsx";


const HomePage = () => {
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

            <HomeStoryComponent />
            <AddPost />
            <PostCard />
        </Layout>
    );
};

export default HomePage;