import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import postStore from "../store/postStore.js";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import LoadingButtonFit from "../Component/button/LoadingButtonFit.jsx";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import authorStore from "../store/authorStore.js";

const UpdatePostPopup = () => {
    const { user } = useParams();
    const path = window.location.pathname;
    const {
        updatePostData,
        setUpdatePostData,
        updatePostReq,
        myPostReq,
        clearUpdatePostData,
        newsFeedReq,
    } = postStore();
    const { myProfileData } = authorStore();
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    const handleEmojiClick = (emojiData) => {
        let newText = updatePostData.caption + emojiData.emoji;
        setUpdatePostData("caption", newText);
    };

    const updatePost = async () => {
        if (!updatePostData.caption || !updatePostData.caption.trim()) {
            toast.error("Post caption cannot be empty");
            return;
        }

        setLoading(true);
        const res = await updatePostReq(updatePostData);
        clearUpdatePostData(null);
        setLoading(false);
        if (res) {
            toast.success("Post updated successfully");
            if (path === "/") {
                await newsFeedReq();
            } else {
                if (user !== "me") {
                    await myPostReq(user);
                } else {
                    await myPostReq(myProfileData.username);
                }
            }
        } else {
            toast.error("Failed to update post");
        }
    };

    const closePopup = () => {
        clearUpdatePostData(null);
    };

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center ${
                darkMode ? 'bg-black/70 backdrop-blur-sm' : 'bg-gray-800 bg-opacity-50'
            }`}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`max-w-lg w-full rounded-xl shadow-xl p-6 relative ${
                    darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
                }`}
            >
                {/* Header Section */}
                <div className={`flex items-center pb-4 mb-4 ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                } border-b`}>
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2">
                        <img
                            src={myProfileData.profile}
                            alt="Profile"
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <textarea
                        value={updatePostData.caption || ""}
                        onChange={(e) => setUpdatePostData("caption", e.target.value)}
                        rows={2}
                        placeholder="Type your update here..."
                        className={`ml-4 flex-grow text-base font-medium resize-none focus:outline-none ${
                            darkMode 
                                ? 'bg-transparent text-gray-200 placeholder-gray-500' 
                                : 'bg-transparent text-gray-700 placeholder-gray-400'
                        }`}
                    />
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-center mt-6">
                    {/* Emoji Picker Icon */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPicker((prev) => !prev)}
                        className={`text-2xl cursor-pointer ${
                            darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-500 hover:text-sky-500'
                        }`}
                    >
                        <MdEmojiEmotions />
                    </motion.button>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        {/* Cancel Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={closePopup}
                            className={`py-2 px-4 rounded-lg font-medium transition duration-200 ${
                                darkMode 
                                    ? 'border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-300' 
                                    : 'border-gray-300 text-gray-700 hover:border-sky-500 hover:text-sky-500'
                            } border`}
                        >
                            Cancel
                        </motion.button>

                        {/* Update Button */}
                        {loading ? (
                            <LoadingButtonFit text="Updating..." darkMode={darkMode} />
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={updatePost}
                                disabled={!updatePostData.caption || !updatePostData.caption.trim()}
                                className={`py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
                                    !updatePostData.caption || !updatePostData.caption.trim()
                                        ? (darkMode 
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                                        : (darkMode 
                                            ? 'bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-500' 
                                            : 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500')
                                }`}
                            >
                                Update Post
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Emoji Picker */}
            {showPicker && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onMouseLeave={() => setShowPicker(false)}
                    className={`absolute top-20 left-1/2 transform -translate-x-1/2 shadow-lg rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                >
                    <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        theme={darkMode ? "dark" : "light"}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default UpdatePostPopup;