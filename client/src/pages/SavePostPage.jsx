import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import postStore from "../store/postStore.js";
import Layout from "../layout/BottomMenu.jsx";
import PostCard from "../Component/post/PostCard.jsx";
import { FaSun, FaMoon, FaExclamationTriangle, FaBookmark } from "react-icons/fa";

const SavePostPage = () => {
    const { savePostListReq, clear_my_post_data, savedPosts } = postStore();
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark" || savedTheme === null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Toggle theme
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Fetch saved posts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                clear_my_post_data();
                await savePostListReq();
            } catch (err) {
                setError("Failed to load saved posts");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Theme classes
    const themeClass = darkMode 
        ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";
    
    const headerClass = darkMode 
        ? "bg-gray-800/80 backdrop-blur-sm border-gray-700 text-white" 
        : "bg-white/80 backdrop-blur-sm border-gray-200 text-gray-900";
    
    const errorClass = darkMode 
        ? "bg-red-900/50 border-red-700 text-red-200" 
        : "bg-red-100 border-red-300 text-red-800";
    
    const emptyStateClass = darkMode 
        ? "text-gray-400" 
        : "text-gray-500";

    return (
        <motion.div 
            className={`min-h-screen ${themeClass} font-sans`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Layout>
                {/* Theme toggle button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDarkMode}
                    className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg"
                >
                    {darkMode ? (
                        <FaSun className="text-yellow-400 text-xl" />
                    ) : (
                        <FaMoon className="text-gray-700 text-xl" />
                    )}
                </motion.button>

                {/* Header */}
                <motion.div 
                    className={`w-full border-b-2 sticky top-0 z-[999999] ${headerClass}`}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-center py-3">
                        <FaBookmark className="mr-2 text-blue-500" />
                        <h1 className="text-center text-xl font-medium">Save Post</h1>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="container mx-auto px-4 py-6">
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
                                    Loading saved posts...
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

                    {/* Empty state */}
                    {!loading && !error && savedPosts && savedPosts.length === 0 && (
                        <motion.div 
                            className="text-center py-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-6xl mb-4">
                                <FaBookmark className={`mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            </div>
                            <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                No saved posts yet
                            </h3>
                            <p className={`${emptyStateClass}`}>
                                Save posts to see them here later
                            </p>
                        </motion.div>
                    )}

                    {/* Posts */}
                    {!loading && !error && savedPosts && savedPosts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <PostCard />
                        </motion.div>
                    )}
                </div>
            </Layout>
        </motion.div>
    );
};

export default SavePostPage;