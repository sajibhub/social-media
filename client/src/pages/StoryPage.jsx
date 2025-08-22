import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PreviewStoryComponent from "../Component/story/PreviewStoryComponent.jsx";
import { FaSun, FaMoon, FaBook } from "react-icons/fa";

const StoryPage = () => {
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

  // Simulate loading (you can remove this if PreviewStoryComponent handles its own loading)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Theme classes
  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
    : "bg-gradient-to-br from-blue-100 to-sky-200 text-gray-900";
  
  const headerClass = darkMode 
    ? "bg-gray-800/80 backdrop-blur-md border-gray-700" 
    : "bg-white/80 backdrop-blur-md border-gray-200";

  return (
    <motion.div 
      className={`min-h-screen ${themeClass} font-sans`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
          <FaBook className="mr-2 text-blue-500" />
          <h1 className="text-center text-xl font-medium">Stories</h1>
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
                Loading stories...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {error && (
          <motion.div 
            className="max-w-md mx-auto mt-8 p-4 rounded-lg bg-red-100 border border-red-300 text-red-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Story content */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PreviewStoryComponent />
          </motion.div>
        )}

        {/* Empty state (optional - you can remove if PreviewStoryComponent handles this) */}
        {!loading && !error && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-6xl mb-4">📖</div>
            <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No stories available
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Check back later for new stories
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StoryPage;