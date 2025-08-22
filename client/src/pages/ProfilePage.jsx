import Layout from "../layout/Layout.jsx";
import UserInfo from "../Component/users/UserInfo.jsx";
import postStore from "../store/postStore.js";
import { useEffect, useState, useRef } from "react";
import PostCard from "../Component/post/PostCard.jsx";
import authorStore from "../store/authorStore.js";
import { useParams } from "react-router-dom";
import uiManage from "../store/uiManage.js";
import FollowersListComponent from "../Component/users/FollowersListComponent.jsx";
import FollowingListComponent from "../Component/users/FollowingListComponent.jsx";
import PersonalInfoComponent from "../Component/users/PersonalInfoComponent.jsx";
import ImageGallery from "../Component/users/ImageGallery.jsx";
import SocialMediaComponent from "../Component/users/SocialMediaComponent.jsx";
import ChangePasswordComponent from "../Component/users/ChangePasswordComponent.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon, FaExclamationTriangle } from "react-icons/fa";

const ProfilePage = () => {
    const { user } = useParams();
    let userName = localStorage.getItem('userName');
    const { myPostReq, clear_my_post_data, my_post_data } = postStore();
    const { readProfileReq, clear_profileData, profileData } = authorStore();
    const { profile_tab } = uiManage();
    
    // Theme state
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark" || savedTheme === null;
    });
    
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState(null);

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        } else if (savedTheme === "light") {
            setDarkMode(false);
        }
    }, []);

    // Save theme preference
    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);



    // Fetch profile and posts data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                clear_profileData();
                
                if (!profileData) {
                    await readProfileReq(user);
                }
                
                setPostsLoading(true);
                setPostsError(null);
                clear_my_post_data();
                await myPostReq(user);
                
            } catch (err) {
                setError("Failed to load profile data");
                setPostsError("Failed to load posts");
                console.error(err);
            } finally {
                setLoading(false);
                setPostsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Theme classes
    const themeClass = darkMode 
        ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";
    
    const cardClass = darkMode 
        ? "bg-gray-800/50 backdrop-blur-sm border-gray-700" 
        : "bg-white/80 backdrop-blur-sm border-gray-200";
    
    const errorClass = darkMode 
        ? "bg-red-900/50 border-red-700 text-red-200" 
        : "bg-red-100 border-red-300 text-red-800";

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <motion.div 
            className={`min-h-screen ${themeClass} font-sans`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Layout>
               
                {/* Loading state */}
                {loading && (
                    <motion.div 
                        className="flex justify-center items-center h-64"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Loading profile...
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Error state */}
                {error && (
                    <motion.div 
                        className={`max-w-md mx-auto mt-8 p-4 rounded-lg border ${errorClass}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            <span>{error}</span>
                        </div>
                    </motion.div>
                )}

                {/* Main content */}
                {!loading && !error && (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants}>
                            <UserInfo />
                        </motion.div>

                        {/* Posts Tab */}
                        {profile_tab === "my-post" && (
                            <motion.div variants={itemVariants}>
                                {postsLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Loading posts...
                                            </p>
                                        </div>
                                    </div>
                                ) : postsError ? (
                                    <motion.div 
                                        className={`max-w-md mx-auto mt-8 p-4 rounded-lg border ${errorClass}`}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="flex items-center">
                                            <FaExclamationTriangle className="mr-2" />
                                            <span>{postsError}</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <PostCard />
                                )}
                            </motion.div>
                        )}

                        {/* Image Gallery Tab */}
                        {profile_tab === "post-photo" && (
                            <motion.div variants={itemVariants}>
                                <ImageGallery />
                            </motion.div>
                        )}

                        {/* Followers Tab */}
                        {profile_tab === "followers" && (
                            <motion.div variants={itemVariants}>
                                <FollowersListComponent />
                            </motion.div>
                        )}

                        {/* Following Tab */}
                        {profile_tab === "following" && (
                            <motion.div variants={itemVariants}>
                                <FollowingListComponent />
                            </motion.div>
                        )}

                        {/* About Tab */}
                        {profile_tab === "about" && (
                            <motion.div variants={itemVariants}>
                                <div className="space-y-6">
                                    <PersonalInfoComponent />
                                    <SocialMediaComponent />
                                    {user === userName && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <ChangePasswordComponent />
                                        </motion.div>
                                    )}
                                    <div className="py-6 lg:py-3"></div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </Layout>
        </motion.div>
    );
};

export default ProfilePage;