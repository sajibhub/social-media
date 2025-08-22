import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import useActiveStore from "../../store/useActiveStore.js";

const SearchResultComponent = () => {
  const userName = localStorage.getItem("userName");
  const { user } = useParams();
  const navigate = useNavigate();
  const { isUserOnline } = useActiveStore();
  const [followLoader, setFollowLoader] = useState({ status: false, id: null });
  const [darkMode, setDarkMode] = useState(false);
  const { followingList, flowReq, followingListReq, readProfileReq, clear_followingList } =
    authorStore();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      clear_followingList();
      await followingListReq(user);
    })();
  }, [user]);

  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  const followHandler = async (id) => {
    setFollowLoader({ status: true, id });
    const res = await flowReq(id);
    setFollowLoader({ status: false, id: null });
    if (res) {
      await readProfileReq(user);
      await followingListReq(user === "me" ? userName : user);
      toast.success("Action Successful");
    } else {
      toast.error("Action Failed");
    }
  };

  // Skeleton loading component
  const skeletonLoader = Array.from({ length: 7 }).map((_, index) => (
    <motion.div
      key={index}
      className={`flex items-center gap-4 p-4 rounded-lg shadow-md animate-pulse ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}
    >
      <div className={`h-12 w-12 rounded-full ${
        darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}></div>
      <div className="flex flex-col flex-grow space-y-2">
        <div className={`h-4 w-1/3 rounded ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
        <div className={`h-4 w-1/4 rounded ${
          darkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}></div>
      </div>
      <div className={`h-8 w-24 rounded-full ${
        darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}></div>
    </motion.div>
  ));

  // Empty state component
  const EmptyState = () => (
    <div className={`flex flex-col items-center justify-center py-16 rounded-lg ${
      darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
    }`}>
      <div className={`text-5xl mb-4 ${
        darkMode ? 'text-gray-600' : 'text-gray-300'
      }`}>👥</div>
      <h3 className={`text-xl font-medium mb-2 ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>No following yet</h3>
      <p className={`text-center max-w-md ${
        darkMode ? 'text-gray-500' : 'text-gray-500'
      }`}>
        This user isn't following anyone yet.
      </p>
    </div>
  );

  return (
    <div className={`px-3 space-y-4 ${darkMode ? 'bg-gray-900' : ''}`}>
      {followingList === null ? (
        skeletonLoader
      ) : followingList.length === 0 ? (
        <EmptyState />
      ) : (
        followingList.map((user, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer flex flex-col items-end lg:flex-row justify-start lg:items-center gap-4 p-4 rounded-lg shadow-lg mb-2 transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:shadow-xl' 
                : 'bg-white border-gray-200 hover:shadow-xl'
            } border`}
          >
            <div className="flex justify-start items-center gap-3 w-full">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToProfile(user.username)}
                className={`h-[50px] w-[50px] flex items-center justify-center rounded-full overflow-hidden border-2 ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <img
                  src={user.profile}
                  alt={`${user.fullName} profile`}
                  className="w-full h-full object-cover"
                />
                {/* Online/Offline Status Indicator */}
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
                    isUserOnline(user._id) 
                      ? (darkMode ? 'bg-green-500 border-gray-900' : 'bg-green-500 border-white') 
                      : (darkMode ? 'bg-red-500 border-gray-900' : 'bg-red-500 border-white')
                  }`}
                ></div>
              </motion.div>
              
              <div className="flex-grow cursor-pointer">
                <h2 className={`text-lg font-semibold flex items-center gap-1 ${
                  darkMode ? 'text-gray-100' : 'text-neutral-900'
                }`}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    onClick={() => goToProfile(user.username)}
                    className={`cursor-pointer hover:underline ${
                      darkMode ? 'text-cyan-300' : 'text-blue-500'
                    }`}
                  >
                    {user.fullName}
                  </motion.span>
                  {user.verify && <VerifiedBadge isVerified={user.verify} darkMode={darkMode} />}
                </h2>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  @{user.username}
                </p>
              </div>
            </div>
            
            {followLoader.id === user._id ? (
              <div className="loader-dark w-8 h-8"></div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => followHandler(user._id)}
                className={`text-sm font-medium py-2 px-6 rounded-full transition-all ${
                  user.isFollowing
                    ? (darkMode 
                      ? 'bg-red-600 text-white hover:bg-red-500' 
                      : 'bg-red-500 text-white hover:bg-red-600')
                    : (darkMode 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                      : 'bg-sky-500 text-white hover:bg-sky-600')
                }`}
              >
                {user.isFollowing ? "Unfollow" : "Follow"}
              </motion.button>
            )}
          </motion.div>
        ))
      )}
      <div className="py-[45px]"></div>
    </div>
  );
};

export default SearchResultComponent;