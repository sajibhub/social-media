import { motion } from "framer-motion";
import { useEffect, useRef, useCallback, useState } from "react";
import { MdAdd, MdKeyboardDoubleArrowRight, MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import StoryStore from "../../store/StoryStore.js";
import uiManage from "../../store/uiManage.js";
import { useNavigate } from "react-router-dom";

const StoryComponent = () => {
    const navigate = useNavigate();
    const { setCreateStory } = uiManage();
    const scrollRef = useRef(null);
    const { StoryData, StoryReq } = StoryStore();
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        StoryReq();
    }, [StoryReq]);

    const scroll = useCallback((direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
        }
    }, []);

    // Skeleton loading component
    const StorySkeleton = () => (
        <div className="relative px-10 max-w-[680px] mx-auto">
            <div className={`absolute left-0 top-0 h-full px-3 z-[300] rounded-l-lg ${
                darkMode ? 'bg-gray-800/80' : 'bg-white/80'
            }`}></div>
            <div className={`absolute right-0 top-0 h-full px-3 z-[300] rounded-r-lg ${
                darkMode ? 'bg-gray-800/80' : 'bg-white/80'
            }`}></div>
            <div className="mt-3 p-3 scroll-bar-hidden flex flex-row gap-5 overflow-x-auto cursor-pointer">
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="max-w-[70px] flex-shrink-0 overflow-hidden">
                        <div className={`h-[55px] w-[55px] rounded-full border-[3px] mx-auto animate-pulse ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'
                        }`}></div>
                        <div className={`h-4 w-20 mx-auto rounded mt-2 animate-pulse ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}></div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!StoryData) {
        return <StorySkeleton />;
    }

    return (
        <div className={`relative px-10 max-w-[680px] mx-auto ${
            darkMode ? 'bg-gray-900' : ''
        }`}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute left-0 top-0 h-full px-3 z-[300] rounded-l-lg transition-colors ${
                    darkMode 
                        ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-cyan-400' 
                        : 'bg-white/80 hover:bg-gray-100/80 text-neutral-700 hover:text-sky-500'
                }`}
                onClick={() => scroll("left")}
            >
                <MdOutlineKeyboardDoubleArrowLeft className="text-2xl font-bold" />
            </motion.button>
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute right-0 top-0 h-full px-3 z-[300] rounded-r-lg transition-colors ${
                    darkMode 
                        ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-cyan-400' 
                        : 'bg-white/80 hover:bg-gray-100/80 text-neutral-700 hover:text-sky-500'
                }`}
                onClick={() => scroll("right")}
            >
                <MdKeyboardDoubleArrowRight className="text-2xl font-bold" />
            </motion.button>
            
            <div 
                ref={scrollRef} 
                className="mt-3 p-3 scroll-bar-hidden flex flex-row gap-5 overflow-x-auto cursor-pointer"
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="max-w-[80px] flex-shrink-0 overflow-hidden"
                    onClick={() => setCreateStory(true)}
                >
                    <div className={`h-[60px] w-[60px] rounded-full border-[3px] mx-auto flex items-center justify-center ${
                        darkMode 
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-cyan-500/50' 
                            : 'bg-gradient-to-br from-gray-100 to-white border-sky-200'
                    }`}>
                        <MdAdd className={`text-2xl ${
                            darkMode ? 'text-cyan-400' : 'text-sky-500'
                        }`} />
                    </div>
                    <div className={`text-xs font-medium text-center mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Your Story
                    </div>
                </motion.div>
                
                {StoryData.map((item, userIndex) => (
                    <motion.div
                        key={userIndex}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="max-w-[80px] flex-shrink-0 overflow-hidden"
                        onClick={() => navigate(`/story/${userIndex}`)}
                    >
                        <div className={`relative h-[60px] w-[60px] rounded-full border-[3px] mx-auto overflow-hidden ${
                            darkMode ? 'border-cyan-500/50' : 'border-sky-200'
                        }`}>
                            <img 
                                src={item.profile} 
                                alt="profile" 
                                className="w-full h-full object-cover" 
                                loading="lazy" 
                            />
                            {/* Gradient overlay */}
                            <div className={`absolute inset-0 rounded-full ${
                                darkMode 
                                    ? 'bg-gradient-to-t from-gray-900/70 to-transparent' 
                                    : 'bg-gradient-to-t from-black/30 to-transparent'
                            }`}></div>
                        </div>
                        <div className={`text-xs font-medium text-center mt-1 truncate ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {item.fullName || "User"}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StoryComponent;