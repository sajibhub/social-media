import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../layout/Layout.jsx";
import StoryComponent from "../Component/story/StoryComponent.jsx";
import AddPost from "../Component/post/AddPost.jsx";
import PostCard from "../Component/post/PostCard.jsx";
import { useNavigate } from "react-router-dom";
import authorStore from "../store/authorStore.js";
import postStore from "../store/postStore.js";

const HomePage = () => {
    const { readProfileReq, suggestUserReq, clear_suggestUser } = authorStore();
    const { newsFeedReq, clear_my_post_data } = postStore();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState("forYou");

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        (async () => {
            clear_my_post_data();
            clear_suggestUser();
            let res = await readProfileReq("me");
            await newsFeedReq();
            await suggestUserReq();
            if (res !== true) {
                navigate('/author');
            }
        })();
    }, []);

    return (
        <Layout>
            {/* Navigation Tabs */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`flex flex-row items-center border-b-2 sticky top-0 z-[999999] backdrop-blur-sm ${
                    darkMode 
                        ? 'bg-gray-900/80 border-gray-700' 
                        : 'bg-white/80 bg-opacity-20 border-gray-200'
                }`}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("forYou")}
                    className={`flex-grow py-4 text-lg font-medium transition-all duration-300 ${
                        activeTab === "forYou"
                            ? (darkMode 
                                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                                : 'text-sky-500 border-b-2 border-sky-500')
                            : (darkMode 
                                ? 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50' 
                                : 'text-neutral-600 hover:text-sky-400 hover:bg-sky-50')
                    }`}
                >
                    For You
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("following")}
                    className={`flex-grow py-4 text-lg font-medium transition-all duration-300 ${
                        activeTab === "following"
                            ? (darkMode 
                                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                                : 'text-sky-500 border-b-2 border-sky-500')
                            : (darkMode 
                                ? 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50' 
                                : 'text-neutral-600 hover:text-sky-400 hover:bg-sky-50')
                    }`}
                >
                    Following
                </motion.button>
            </motion.div>

            {/* Story Component */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <StoryComponent />
            </motion.div>

            {/* Add Post Component */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <AddPost />
            </motion.div>

            {/* Post Card Component */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <PostCard />
            </motion.div>
        </Layout>
    );
};

export default HomePage;