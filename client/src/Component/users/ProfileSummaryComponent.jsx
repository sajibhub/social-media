import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import { useNavigate, useParams } from "react-router-dom";
import useActiveStore from "../../store/useActiveStore.js";
import { useEffect, useState } from "react";

const ProfileSummaryComponent = () => {
  const { user } = useParams();
  const me = localStorage.getItem("userName");
  const { myProfileData } = authorStore();
  const navigate = useNavigate();
  const { isUserOnline } = useActiveStore();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const goToProfile = (user) => {
    navigate("/profile/" + user);
  };

  // Skeleton loading component
  const Skeleton = () => (
    <div className={`mx-2 mt-2 rounded-lg shadow-lg overflow-hidden animate-pulse ${
      darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
    } border`}>
      <div className={`h-[100px] w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      <div className={`h-[70px] w-[70px] rounded-full mx-[10px] mt-[-35px] shadow ${
        darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}></div>
      <div className="mx-[15px] pb-3 mt-3 space-y-2">
        <div className={`h-6 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className={`h-4 rounded w-1/3 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
      </div>
    </div>
  );

  if (!myProfileData) {
    return <Skeleton />;
  }

  return (
    <>
      {user !== me && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`mx-2 mt-2 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          } border`}
        >
          {/* Cover Image */}
          <div className="h-[100px] w-full overflow-hidden">
            <img
              src={myProfileData.cover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Profile Image with Online/Offline Indicator */}
          <div className="relative">
            <div className={`h-16 w-16 rounded-full mx-[10px] mt-[-35px] shadow border-2 ${
              darkMode ? 'border-gray-900' : 'border-white'
            }`}>
              <img
                src={myProfileData.profile}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
              {/* Online/Offline Status Indicator */}
              <div
                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 ${
                  isUserOnline(myProfileData?._id) 
                    ? (darkMode ? 'bg-green-500 border-gray-900' : 'bg-green-500 border-white') 
                    : (darkMode ? 'bg-red-500 border-gray-900' : 'bg-red-500 border-white')
                }`}
              ></div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mx-[15px] pb-3 mt-3">
            <h1 className={`text-lg font-bold flex items-center gap-1 ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <motion.span
                whileHover={{ scale: 1.05 }}
                onClick={() => goToProfile(myProfileData.username)}
                className={`cursor-pointer hover:underline ${
                  darkMode ? 'text-cyan-300' : 'text-blue-500'
                }`}
              >
                {myProfileData.fullName}
              </motion.span>
              {myProfileData.verify && (
                <VerifiedBadge isVerified={myProfileData.verify} darkMode={darkMode} />
              )}
            </h1>
            <h3 className={`text-sm font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              @{myProfileData.username}
            </h3>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {myProfileData.profession || "Software Engineer"}
            </p>
          </div>
          
          {/* Additional Info */}
          <div className="mx-[15px] mb-3 space-y-1">
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              📍 {myProfileData.location || "San Francisco, USA"}
            </p>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              👥 {myProfileData.followers || 0} Followers
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="mx-[15px] pb-3 flex justify-between gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile/me")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                darkMode 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              View Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Message
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ProfileSummaryComponent;