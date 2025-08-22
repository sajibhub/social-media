import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import { readProfile } from "../../redux/features/author/profileSlice.js";

const SideProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);

  // Redux state
  const myProfileData = useSelector((state) => state.profile.myProfile);
  const activeUsers = useSelector((state) => state.activeUsers.activeUsers || []);
console.log(myProfileData)
  // Fetch profile once on mount
  useEffect(() => {
    if (!myProfileData) {
      dispatch(readProfile("me"));
    }
  }, [dispatch, myProfileData]);

  // Determine if user is online
  const isOnline = myProfileData?._id && activeUsers.includes(myProfileData._id);

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
  }, []);

  const goToProfile = () => {
    if (myProfileData?.username) navigate(`/profile/${myProfileData.username}`);
  };

  // Skeleton loader
  if (!myProfileData) {
    return (
      <div
        className={`p-4 rounded-lg shadow-md animate-pulse ${
          darkMode ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <div className="h-24 w-24 rounded-full mx-auto bg-gray-700 mb-3"></div>
        <div className="h-4 w-3/4 mx-auto bg-gray-600 rounded mb-2"></div>
        <div className="h-3 w-1/2 mx-auto bg-gray-500 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      className={`p-4 rounded-lg shadow-md flex flex-col items-center text-center ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Profile Image & Online Status */}
      <div className="relative w-24 h-24 mb-3">
        <img
          src={myProfileData.profile}
          alt="Profile"
          className={`w-full h-full object-cover rounded-full border-2 ${
            darkMode ? "border-gray-900" : "border-white"
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 ${
            isOnline
              ? darkMode
                ? "bg-green-500 border-gray-900"
                : "bg-green-500 border-white"
              : darkMode
              ? "bg-red-500 border-gray-900"
              : "bg-red-500 border-white"
          }`}
        ></span>
      </div>

      {/* Name & Verified */}
      <h2 className="text-lg font-bold flex items-center gap-1 justify-center">
        {myProfileData.fullName}
        {myProfileData.verify && (
          <VerifiedBadge isVerified={myProfileData.verify} darkMode={darkMode} />
        )}
      </h2>
      <p className="text-sm text-gray-400 mb-2">@{myProfileData.username}</p>

      {/* Profession & Location */}
      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {myProfileData.profession || "Software Engineer"}
      </p>
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-700"} mb-2`}>
        📍 {myProfileData.location || "San Francisco, USA"}
      </p>

      {/* Followers */}
      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} mb-3`}>
        👥 {myProfileData.followers || 0} Followers
      </p>

      {/* Buttons */}
      <div className="flex gap-2 w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToProfile}
          className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
            darkMode
              ? "bg-cyan-600 text-white hover:bg-cyan-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          View Profile
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
            darkMode
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Message
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SideProfile;
