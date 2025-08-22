import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Layout from "../layout/Layout.jsx";
import { IoSearch } from "react-icons/io5";
import SearchResultComponent from "../Component/users/SearchResultComponent.jsx";
import authorStore from "../store/authorStore.js";
import { FaExclamationTriangle } from "react-icons/fa";

const SearchPage = () => {
  const { searchUserReq } = authorStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    // Default to light mode if null
    return savedTheme === "dark";
  });
  const searchInputRef = useRef(null);
  
  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  
  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      await searchUserReq(search);
    } catch (err) {
      setError("Failed to search users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const clearSearch = () => {
    setSearch('');
    setError(null);
  };
  
  // Theme classes
  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900";
  
  const headerClass = darkMode 
    ? "bg-gray-800/80 backdrop-blur-md border-gray-700" 
    : "bg-white/80 backdrop-blur-md border-gray-200";
  
  const inputClass = darkMode 
    ? "bg-transparent text-white placeholder-gray-400" 
    : "bg-transparent text-gray-900 placeholder-gray-500";
  
  const errorClass = darkMode 
    ? "bg-red-900/50 border-red-700 text-red-200" 
    : "bg-red-100 border-red-300 text-red-800";

  return (
    <motion.div 
      className={`min-h-screen ${themeClass} font-sans`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Layout>

        
        {/* Search form */}
        <motion.form
          onSubmit={handleSearch}
          className={`w-full border-b-2 sticky top-0 z-[999999] flex items-center ${headerClass}`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative flex-grow flex items-center">
            <input
              ref={searchInputRef}
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type here"
              className={`py-4 ps-4 w-full text-lg flex-grow outline-none ${inputClass}`}
              disabled={loading} 
            />
            {search && (
              <motion.button
                type="button"
                onClick={clearSearch}
                className={`absolute right-12 ${
                  darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="text-xl" />
              </motion.button>
            )}
          </div>
          <div className="me-5">
            {loading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
            ) : (
              <motion.button
                type="submit" 
                disabled={loading || !search.trim()}
                className="text-xl font-medium hover:text-sky-500 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IoSearch />
              </motion.button>
            )}
          </div>
        </motion.form>
        
        {/* Error message */}
        {error && (
          <motion.div 
            className={`max-w-md mx-auto mt-4 p-4 rounded-lg border ${errorClass}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
        
        {/* Search results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SearchResultComponent />
        </motion.div>
      </Layout>
    </motion.div>
  );
};

export default SearchPage;