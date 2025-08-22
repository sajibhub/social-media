import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import LoadingButtonFit from "../button/LoadingButtonFit.jsx";
import VerifiedBadge from "../utility/VerifyBadge.jsx";

const SearchResultComponent = () => {
  const navigate = useNavigate();
  const [followLoader, setFollowLoader] = useState({ status: false, id: null });
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { searchUserReq, searchUserData, flowReq, searchKeywords } = authorStore();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Handle loading state when search keywords change
  useEffect(() => {
    if (searchKeywords && searchKeywords.trim() !== '') {
      setIsLoading(true);
      // Simulate a slight delay to show loading state
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchKeywords]);

  const goToProfile = (username) => navigate(`/profile/${username}`);
  
  const followHandle = async (id) => {
    setFollowLoader({ status: true, id });
    const res = await flowReq(id);
    setFollowLoader({ status: false, id: null });
    if (res) {
      toast.success("Following Successful");
      await searchUserReq(searchKeywords);
    } else {
      toast.error("Following Failed");
    }
  };

  // Skeleton loading component
  const Skeleton = () => (
    <div className="mt-4 px-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-sm animate-pulse ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <div className={`h-12 w-12 rounded-full ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className="flex-grow">
            <div className={`h-4 rounded w-1/3 mb-2 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}></div>
            <div className={`h-4 rounded w-2/3 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}></div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Show skeleton when loading or when data is null and there are search keywords
  if (isLoading || (searchUserData === null && searchKeywords && searchKeywords.trim() !== '')) {
    return <Skeleton />;
  }

  // Show message when no search keywords
  if (!searchKeywords || searchKeywords.trim() === '') {
    return (
      <div className={`mt-8 text-center py-12 rounded-lg ${
        darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <p className={`text-lg font-medium ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Search for users to see results
        </p>
      </div>
    );
  }

  // Show message when no results found
  if (searchUserData && searchUserData.length === 0) {
    return (
      <div className={`mt-8 text-center py-12 rounded-lg ${
        darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <p className={`text-lg font-medium ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No users found for "{searchKeywords}"
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 px-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {searchUserData.map((user) => (
        <motion.div
          key={user._id}
          whileHover={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, scale: { type: "spring", stiffness: 200 } }}
          className={`flex flex-col items-center gap-4 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
            darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          {/* Profile Picture */}
          <div className="relative cursor-pointer" onClick={() => goToProfile(user.username)}>
            <div className={`h-16 w-16 rounded-full overflow-hidden border-2 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <img
                src={user.profile || '/default-avatar.png'}
                alt={user.fullName}
                className="object-cover w-full h-full"
              />
            </div>
            {user.verify && (
              <div className="absolute bottom-0 right-0">
                <VerifiedBadge isVerified={user.verify} darkMode={darkMode} />
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="text-center">
            <h2
              onClick={() => goToProfile(user.username)}
              className={`text-lg font-medium cursor-pointer hover:underline break-words text-center ${
                darkMode ? 'text-gray-200 hover:text-cyan-300' : 'text-neutral-900 hover:text-blue-500'
              }`}
            >
              {user.fullName}
            </h2>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-neutral-600'
            }`}>
              Followers: {user.followers}
            </p>
            {/* Display Full Bio */}
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-500' : 'text-neutral-500'
            }`}>
              {user.bio || "No bio available"}
            </p>
          </div>
          
          {/* Follow Button */}
          <div>
            {followLoader.id === user._id ? (
              <LoadingButtonFit darkMode={darkMode} />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => followHandle(user._id)}
                className={`px-4 py-2 rounded-lg transition duration-200 focus:outline-none ${
                  darkMode 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Follow
              </motion.button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SearchResultComponent;