import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../layout/Layout.jsx";
import PrivacySettings from "../Component/setting/PrivacySettings.jsx";
import NotificationsSettings from "../Component/setting/NotificationsSettings.jsx";
import { FaSun, FaMoon, FaCog, FaShieldAlt, FaBell } from "react-icons/fa";

const SettingPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || savedTheme === null;
  });

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

  // Theme classes
  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";
  
  const headerClass = darkMode 
    ? "bg-gray-800/80 backdrop-blur-md border-gray-700" 
    : "bg-white/80 backdrop-blur-md border-gray-200";
  
  const sectionClass = darkMode 
    ? "bg-gray-800/50 backdrop-blur-sm border-gray-700" 
    : "bg-white/80 backdrop-blur-sm border-gray-200";

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
          <div className="flex items-center justify-center py-4">
            <FaCog className="mr-2 text-blue-500" />
            <h1 className="text-center text-xl font-medium">Settings</h1>
          </div>
        </motion.div>

        {/* Settings sections */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Privacy Settings Section */}
          <motion.div
            className={`mb-8 rounded-xl overflow-hidden shadow-lg ${sectionClass} border`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-3 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <FaShieldAlt className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Privacy Settings</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage your privacy preferences and control who can see your content
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <PrivacySettings />
            </div>
          </motion.div>

          {/* Notifications Settings Section */}
          <motion.div
            className={`rounded-xl overflow-hidden shadow-lg ${sectionClass} border`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-3 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <FaBell className="text-purple-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Notification Settings</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customize how you receive notifications and updates
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <NotificationsSettings />
            </div>
          </motion.div>
        </div>
      </Layout>
    </motion.div>
  );
};

export default SettingPage;