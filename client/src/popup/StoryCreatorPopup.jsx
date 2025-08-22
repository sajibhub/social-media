import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import uiManage from "../store/uiManage.js";
import StoryStore from "../store/StoryStore.js";
import toast from "react-hot-toast";
import { FaImages, FaTimes } from "react-icons/fa";

export default function StoryCreatorPopup() {
    const { createStory, setCreateStory } = uiManage();
    const { createStoryReq } = StoryStore();
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImageFile(file);
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const createStoryHandler = async () => {
        if (!image && !text.trim()) {
            toast.error("Please add an image or text to create a story");
            return;
        }

        setLoading(true);
        const response = await createStoryReq(imageFile, text);
        setLoading(false);
        if (response === 201) {
            toast.success("Story Created Successfully!");
            setCreateStory(false);
            setText("");
            setImage(null);
            setImageFile("");
        } else {
            toast.error(response.message || "Failed to create story");
        }
    };

    const closePopup = () => {
        setCreateStory(false);
        setText("");
        setImage(null);
        setImageFile("");
    };

    if (!createStory) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-[9999999] ${
            darkMode ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/50'
        }`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-md p-6 rounded-xl shadow-2xl relative ${
                    darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
                }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold ${
                        darkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                        Create a Story
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={closePopup}
                        className={`p-2 rounded-full ${
                            darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <FaTimes />
                    </motion.button>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-5">
                    {/* Image Preview */}
                    {image && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="overflow-hidden rounded-lg"
                        >
                            <img 
                                src={image} 
                                alt="Uploaded" 
                                className="w-full h-48 object-cover rounded-lg" 
                            />
                        </motion.div>
                    )}

                    {/* Image Upload */}
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed cursor-pointer ${
                                darkMode 
                                    ? 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50' 
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                            <FaImages className={`text-3xl mb-2 ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {image ? "Change Image" : "Upload Image"}
                            </p>
                        </motion.div>
                    </div>

                    {/* Text Input */}
                    <textarea
                        placeholder="Write something..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className={`w-full p-4 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all ${
                            darkMode 
                                ? 'bg-gray-800 border-gray-700 text-gray-200 focus:ring-cyan-500' 
                                : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
                        } border`}
                        rows={3}
                    />

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createStoryHandler}
                        disabled={loading || (!image && !text.trim())}
                        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-3 transition-all ${
                            loading || (!image && !text.trim())
                                ? (darkMode 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                                : (darkMode 
                                    ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600')
                        }`}
                    >
                        {loading ? (
                            <div className="loader"></div>
                        ) : (
                            "Post Story"
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}