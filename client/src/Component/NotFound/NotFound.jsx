import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  return (
    <div className={`flex items-center justify-center min-h-screen ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-100 to-gray-200'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center p-10 rounded-2xl shadow-xl w-full sm:w-96 ${
          darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <FaExclamationTriangle className={`text-4xl ${
              darkMode ? 'text-red-400' : 'text-red-500'
            }`} />
            <div className={`absolute -top-2 -right-2 text-4xl font-bold ${
              darkMode ? 'text-red-400' : 'text-red-500'
            }`}>404</div>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-2xl font-bold mb-4 ${
            darkMode ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          Page Not Found
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`mb-8 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Oops! The page you're looking for doesn't exist.
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
            darkMode 
              ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <FaHome />
          Go to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;