import { TiHome } from "react-icons/ti";
import { IoMdNotifications } from "react-icons/io";
import { FaBookmark, FaSearch, FaSignOutAlt, FaUser, FaUsers, FaSun, FaMoon } from "react-icons/fa";
import { RiMessage3Fill, RiStickyNoteAddFill } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import authorStore from "../store/authorStore.js";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import NotificationBadge from "../Component/utility/NotificationBadge";

const Menu = () => {
    const { myProfileData, SignOutReq } = authorStore();
    const [userName, setUserName] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const storedUserName = localStorage.getItem("userName");
        if (storedUserName) {
            setUserName(storedUserName);
        }
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const menuItems = [
        { icon: <TiHome className="text-2xl" />, label: "Home", route: "/" },
        { icon: <FaSearch className="text-2xl" />, label: "Search", route: "/search" },
        {
            icon: (
                <div className="relative">
                    <IoMdNotifications className="text-2xl" />
                    <NotificationBadge count={myProfileData?.notification} darkMode={darkMode} />
                </div>
            ),
            label: "Notification",
            route: "/notification",
        },
        { icon: <RiMessage3Fill className="text-2xl" />, label: "Messages", route: "/conversation" },
        { icon: <FaBookmark className="text-2xl" />, label: "Saved Posts", route: "/save-post" },
        { icon: <RiStickyNoteAddFill className="text-2xl" />, label: "Add Post", route: "/add-post" },
        { icon: <FaUser className="text-2xl" />, label: "Profile", route: `/profile/${userName}` },
    ];

    const handleSignOut = async () => {
        setSignOutLoading(true);
        const confirmSignOut = confirm("Are you sure you want to sign out?");
        if (confirmSignOut) {
            const res = await SignOutReq();
            localStorage.clear();
            setSignOutLoading(false);
            if (res) {
                navigate("/author");
                toast.success("Signed Out Successfully");
            } else {
                toast.error("Sign Out Failed");
            }
        } else {
            toast.error("Sign Out Cancelled");
            setSignOutLoading(false);
        }
    };

    return (
        <div className={`max-lg:w-[250px] xl:w-72 h-screen px-5 py-8 overflow-y-auto scroll-bar-hidden
        fixed top-0 max-lg:left-0 min-lg:left-20 z-50 transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-white to-gray-50'}`}
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src="/image/logo.png"
                    alt="logo"
                    className="h-14 w-auto mb-8 mx-auto cursor-pointer"
                    onClick={() => navigate("/")}
                />
            </motion.div>
            
            {/* Menu Items */}
            <div className="space-y-3">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.route;
                    return (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.03, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                                isActive 
                                    ? (darkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-blue-100 text-blue-500') 
                                    : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                            }`}
                            onClick={() => navigate(item.route)}
                        >
                            <div className={`icon ${isActive ? (darkMode ? 'text-cyan-400' : 'text-blue-500') : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                {item.icon}
                            </div>
                            <span className={`text-lg font-medium ${isActive ? (darkMode ? 'text-cyan-300' : 'text-blue-600') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                {item.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Divider */}
            <div className="my-6 flex items-center justify-center">
                <div className={`h-px flex-grow ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <span className={`mx-4 text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>MORE</span>
                <div className={`h-px flex-grow ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
            
            {/* Dark Mode Toggle */}
            <motion.div
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer mb-3"
                onClick={toggleDarkMode}
            >
                <div className={`icon ${darkMode ? 'text-yellow-300' : 'text-gray-600'}`}>
                    {darkMode ? <FaSun className="text-2xl" /> : <FaMoon className="text-2xl" />}
                </div>
                <span className={`text-lg font-medium ${darkMode ? 'text-yellow-300' : 'text-gray-700'}`}>
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
            </motion.div>
            
            {/* Settings */}
            <motion.div
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer mb-3"
                onClick={() => navigate("/setting")}
            >
                <div className={`icon ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <IoSettingsSharp className="text-2xl" />
                </div>
                <span className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Settings
                </span>
            </motion.div>
            
            {/* Sign Out */}
            <motion.div
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                    darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
                onClick={handleSignOut}
            >
                {signOutLoading ? (
                    <div className="loader-dark"></div>
                ) : (
                    <div className={`icon ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                        <FaSignOutAlt className="text-2xl" />
                    </div>
                )}
                <span className={`text-lg font-medium ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                    Sign Out
                </span>
            </motion.div>
        </div>
    );
};

export default Menu;