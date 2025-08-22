import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser, FaSun, FaMoon } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { BsBookmarkFill, BsPlusSquareFill } from "react-icons/bs";
import NotificationBadge from "../Component/utility/NotificationBadge";
import authorStore from "../store/authorStore.js";
import { RiMessage3Fill } from "react-icons/ri";
import { useEffect, useState } from "react";

const menuItems = [
  { path: "/", icon: TiHome, label: "Home" },
  { path: "/search", icon: FaSearch, label: "Search" },
  { path: "/notification", icon: IoMdNotifications, badge: true, label: "Notifications" },
  { path: "/conversation", icon: RiMessage3Fill, label: "Messages" },
  { path: "/save-post", icon: BsBookmarkFill, label: "Saved" },
  { path: "/add-post", icon: BsPlusSquareFill, label: "Create", isCreate: true },
  { path: "/profile", icon: FaUser, isProfile: true, label: "Profile" },
];

const BottomMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { myProfileData } = authorStore();
  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    // Check for saved theme preference or default to light mode
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

  const isActivePath = (path, isProfile) => {
    if (isProfile && userName) {
      return location.pathname === `/profile/${userName}`;
    }
    return location.pathname === path;
  };

  const handleNavigation = (path, isProfile) => {
    if (isProfile && userName) {
      navigate(`/profile/${userName}`);
    } else {
      navigate(path);
    }
  };

  return (
    <nav 
      className={`py-3 w-full shadow-lg border-t flex justify-between items-center fixed bottom-0 left-0 right-0 z-10 backdrop-blur-sm transition-colors duration-300 ${
        darkMode 
          ? "bg-gradient-to-r from-gray-900 to-black border-gray-800" 
          : "bg-gradient-to-r from-white to-gray-50 border-gray-200"
      }`}
      aria-label="Main navigation"
    >
      {menuItems.map(({ path, icon: Icon, badge, isProfile, label, isCreate }, index) => (
        <motion.button
          key={index}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05,
            type: "spring", 
            stiffness: 300, 
            damping: 15 
          }}
          className={`${
            isActivePath(path, isProfile)
              ? (darkMode ? "text-cyan-400" : "text-sky-500")
              : (darkMode ? "text-gray-400 hover:text-cyan-300" : "text-gray-600 hover:text-sky-400")
          } flex-shrink-0 relative flex flex-col items-center justify-center transition-colors duration-200 ${
            isCreate ? "-mt-6" : ""
          }`}
          onClick={() => handleNavigation(path, isProfile)}
          aria-label={label}
          aria-current={isActivePath(path, isProfile) ? "page" : undefined}
        >
          {isCreate ? (
            <div className={`rounded-full p-3 shadow-lg ${
              darkMode 
                ? "bg-gradient-to-r from-cyan-600 to-blue-700" 
                : "bg-gradient-to-r from-sky-500 to-blue-600"
            }`}>
              <Icon className="text-white text-2xl" />
            </div>
          ) : (
            <>
              <div className="relative">
                <Icon className={`text-2xl ${isActivePath(path, isProfile) ? "scale-110" : ""} transition-transform duration-200`} />
                {badge && myProfileData?.notification > 0 && (
                  <NotificationBadge count={myProfileData?.notification} darkMode={darkMode} />
                )}
              </div>
              {isActivePath(path, isProfile) && (
                <motion.div 
                  className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    darkMode ? "bg-cyan-400" : "bg-sky-500"
                  }`}
                  layoutId="activeIndicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                />
              )}
            </>
          )}
          <span className={`text-xs mt-1 font-medium ${
            isActivePath(path, isProfile)
              ? (darkMode ? "text-cyan-400" : "text-sky-500")
              : (darkMode ? "text-gray-400" : "text-gray-500")
          }`}>
            {label}
          </span>
        </motion.button>
      ))}
      
      {/* Dark Mode Toggle */}
      <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: menuItems.length * 0.05,
          type: "spring", 
          stiffness: 300, 
          damping: 15 
        }}
        className={`${
          darkMode ? "text-yellow-300" : "text-gray-600"
        } flex-shrink-0 relative flex flex-col items-center justify-center transition-colors duration-200`}
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        <div className="relative">
          {darkMode ? (
            <FaSun className="text-2xl" />
          ) : (
            <FaMoon className="text-2xl" />
          )}
        </div>
        <span className={`text-xs mt-1 font-medium ${
          darkMode ? "text-yellow-300" : "text-gray-500"
        }`}>
          {darkMode ? "Light" : "Dark"}
        </span>
      </motion.button>
    </nav>
  );
};

export default BottomMenu;