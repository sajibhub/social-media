import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
import { useEffect, useState } from "react";
import LoadingButtonFit from "../button/LoadingButtonFit.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import useActiveStore from "../../store/useActiveStore.js";

const SuggestUserComponent = () => {
  const navigate = useNavigate();
  const [followLoader, setFollowLoader] = useState({ status: false, id: null });
  const [darkMode, setDarkMode] = useState(false);
  const { suggestUser, suggestUserReq, flowReq, update_suggestUser } = authorStore();
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
      await suggestUserReq();
    })();
  }, []);

  const followHandel = async (id, isFollowing) => {
    setFollowLoader({ status: true, id: id });
    let res = await flowReq(id);
    setFollowLoader({ status: false, id: null });
    if (res) {
      toast.success(isFollowing ? "Unfollowed Successfully" : "Followed Successfully");
      update_suggestUser(id, { isFollowing: !isFollowing });
    } else {
      toast.error("Action Failed");
    }
  };

  const goToProfile = (user) => {
    navigate("/profile/" + user);
  };

  // Skeleton loading component
  const Skeleton = () => (
    <div className="mt-6 mx-4">
      <h1 className={`mb-4 text-lg font-semibold animate-pulse ${
        darkMode ? 'bg-gray-700 h-6 w-48 rounded' : 'bg-gray-200 h-6 w-48 rounded'
      }`}></h1>
      {Array(5).fill(0).map((_, index) => (
        <div
          key={index}
          className={`flex items-center gap-4 p-4 rounded-lg mb-4 shadow animate-pulse ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          <div className={`h-16 w-16 rounded-full ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
          <div className="flex-grow space-y-2">
            <div className={`h-4 rounded ${
              darkMode ? 'bg-gray-700 w-1/2' : 'bg-gray-200 w-1/2'
            }`}></div>
            <div className={`h-3 rounded ${
              darkMode ? 'bg-gray-600 w-1/3' : 'bg-gray-200 w-1/3'
            }`}></div>
          </div>
          <div className={`h-8 w-20 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
        </div>
      ))}
    </div>
  );

  if (suggestUser === null) {
    return <Skeleton />;
  }

  return (
    <div className="mt-6 mx-4">
      <h1 className={`mb-4 text-lg font-semibold ${
        darkMode ? 'text-gray-200' : 'text-neutral-800'
      }`}>Suggested For You</h1>
      
      <div className="space-y-2">
        {suggestUser.map((user, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
            className={`flex items-center gap-2 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            } border`}
          >
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToProfile(user.username)}
                className={`h-16 w-16 rounded-full overflow-hidden cursor-pointer border-2 ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                }`}
              >
                <img
                  src={user.profile}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </motion.div>
              
              {/* Online/Offline Status Indicator */}
              <div
                className={`absolute bottom-1 right-0 h-4 w-4 rounded-full border-2 ${
                  isUserOnline(user._id) 
                    ? (darkMode ? 'bg-green-500 border-gray-900' : 'bg-green-500 border-white') 
                    : (darkMode ? 'bg-red-500 border-gray-900' : 'bg-red-500 border-white')
                }`}
              ></div>
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center gap-1">
                <motion.h2
                  whileHover={{ scale: 1.02 }}
                  onClick={() => goToProfile(user.username)}
                  className={`text-base font-semibold cursor-pointer hover:underline ${
                    darkMode ? 'text-gray-200' : 'text-neutral-900'
                  }`}
                >
                  {user.fullName}
                </motion.h2>
                {user.verify && <VerifiedBadge isVerified={user.verify} darkMode={darkMode} />}
              </div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-neutral-600'
              }`}>{user.username}</p>
            </div>
            
            <div>
              {followLoader.status && followLoader.id === user._id ? (
                <LoadingButtonFit darkMode={darkMode} />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => followHandel(user._id, user.isFollowing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 focus:outline-none ${
                    user.isFollowing
                      ? (darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200')
                      : (darkMode 
                        ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                        : 'bg-blue-500 text-white hover:bg-blue-600')
                  }`}
                >
                  {user.isFollowing ? "Unfollow" : "Follow"}
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SuggestUserComponent;