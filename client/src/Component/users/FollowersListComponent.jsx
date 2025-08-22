import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import LoadingButtonFit from "../button/LoadingButtonFit.jsx";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import useActiveStore from "../../store/useActiveStore.js";

const SearchResultComponent = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const [followLoader, setFollowLoader] = useState({
    status: false,
    id: null,
  });
  const [darkMode, setDarkMode] = useState(false);
  const { clear_followersList, followersReq } = authorStore();
  const { followersList, flowReq, update_followersList } = authorStore();
  const { isUserOnline } = useActiveStore();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      clear_followersList();
      await followersReq(user);
    })();
  }, [user]);

  const goToProfile = (user) => {
    navigate("/profile/" + user);
  };

  const followHandel = async (id, isFollowing) => {
    setFollowLoader({
      status: true,
      id: id,
    });
    let res = await flowReq(id);
    setFollowLoader({
      status: false,
      id: null,
    });
    if (res) {
      if (isFollowing === true) {
        update_followersList(id, { isFollowing: false });
      }
      if (isFollowing === false) {
        update_followersList(id, { isFollowing: true });
      }
      toast.success("Action Successful");
    } else {
      toast.error("Action Fail");
    }
  };

  // Skeleton loading component
  const Skeleton = () => (
    <div className="mt-4 px-3">
      {[1, 1, 1].map((_, i) => (
        <motion.div
          key={i}
          className={`flex items-center gap-4 p-4 rounded-lg shadow-md animate-pulse ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          <div className={`h-12 w-12 rounded-full ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className="flex flex-col flex-grow space-y-2">
            <div className={`h-4 rounded w-1/3 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}></div>
            <div className={`h-4 rounded w-1/4 ${
              darkMode ? 'bg-gray-600' : 'bg-gray-200'
            }`}></div>
          </div>
          <div className={`h-8 w-24 rounded-full ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
        </motion.div>
      ))}
    </div>
  );

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
      }`}>No followers yet</h3>
      <p className={`text-center max-w-md ${
        darkMode ? 'text-gray-500' : 'text-gray-500'
      }`}>
        This user doesn't have any followers yet.
      </p>
    </div>
  );

  if (followersList === null) {
    return <Skeleton />;
  }

  if (followersList.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`px-3 ${darkMode ? 'bg-gray-900' : ''}`}>
      {followersList.map((user, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          className={`cursor-pointer flex flex-col items-end lg:flex-row lg:justify-start lg:items-center gap-4 p-4 rounded-lg shadow-lg mb-2 transition-all ${
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
              className={`relative h-[50px] w-[50px] flex items-center justify-center rounded-full overflow-hidden border-2 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <img
                src={user.profile}
                alt="User Profile"
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
            
            <div className="flex-grow">
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
              <motion.h3
                whileHover={{ scale: 1.05 }}
                onClick={() => goToProfile(user.username)}
                className={`text-sm font-normal cursor-pointer ${
                  darkMode ? 'text-gray-400' : 'text-neutral-600'
                }`}
              >
                @{user.username}
              </motion.h3>
            </div>
          </div>
          
          {followLoader.id === user._id ? (
            <LoadingButtonFit darkMode={darkMode} />
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => followHandel(user._id, user.isFollowing)}
              className={`text-sm w-fit font-semibold py-2 px-6 rounded-full transition-colors duration-300 transform ${
                user.isFollowing
                  ? (darkMode 
                    ? 'bg-red-600 text-white hover:bg-red-500' 
                    : 'bg-red-500 text-white hover:bg-red-600')
                  : (darkMode 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                    : 'bg-sky-600 text-white hover:bg-sky-700')
              }`}
            >
              {user.isFollowing ? "Unfollow" : "Follow"}
            </motion.button>
          )}
        </motion.div>
      ))}
      <div className="py-[40px]"></div>
    </div>
  );
};

export default SearchResultComponent;