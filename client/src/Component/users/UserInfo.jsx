import authorStore from "../../store/authorStore.js";
import { MdEmail } from "react-icons/md";
import { IoCallSharp } from "react-icons/io5";
import { FaSquareFacebook } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io";
import { TbBrandFiverr } from "react-icons/tb";
import { FaGithub, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import LoadingButtonFit from "../button/LoadingButtonFit.jsx";
import uiManage from "../../store/uiManage.js";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import useActiveStore from '../../store/useActiveStore.js'
import { socket } from "../../utils/socket.js";
import { motion } from "framer-motion";

const UserInfo = () => {
  const { SignOutReq } = authorStore();
  const navigate = useNavigate();
  const { isUserOnline } = useActiveStore();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [logoutModel, setLogoutModel] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useParams();
  const myUser = localStorage.getItem("userName");
  const myId = localStorage.getItem("id");
  const { profileData, flowReq, readProfileReq } = authorStore();
  const { set_profile_tab, profile_tab, set_edit_profile_Ui_Control } = uiManage();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const openNewWindow = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMessageClick = (receiverId) => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("conversationCreated", { receiverId });
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return "Unknown";
    const last = new Date(timestamp);
    const now = new Date();
    const diffMs = now - last;
    const diffSec = diffMs / 1000;
    const diffMin = diffSec / 60;
    const diffHr = diffMin / 60;
    const diffDay = diffHr / 24;
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${Math.floor(diffMin)} min ago`;
    if (diffHr < 24 && now.toDateString() === last.toDateString())
      return `Today at ${last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDay < 2)
      return `Yesterday at ${last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDay < 7)
      return `${last.toLocaleDateString(undefined, { weekday: 'long' })}`;
    if (diffDay < 30)
      return `${Math.floor(diffDay)} days ago`;
    if (diffDay < 365)
      return `${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    return `${last.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}`;
  };

  const handleLogout = async () => {
    setSignOutLoading(true);
    const res = await SignOutReq();
    localStorage.clear();
    setSignOutLoading(false);
    if (res) {
      navigate("/author");
      toast.success("Log Out Successfully");
    }
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    const handleNewConversation = (newConversation) => {
      navigate(`/message/${newConversation._id}`);
    };
    socket.on("newConversation", handleNewConversation);
    return () => {
      socket.off("newConversation", handleNewConversation);
    };
  }, [navigate]);

  // Skeleton loading component
  const Skeleton = () => (
    <div className={`rounded-lg mb-6 animate-pulse ${
      darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } border shadow-sm`}>
      <div className={`h-[200px] w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      <div className={`h-[100px] w-[100px] rounded-full mx-[25px] mt-[-50px] shadow ${
        darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`} />
      <div className="mx-[25px] pb-3 mt-3">
        <div className={`h-6 rounded w-1/3 mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`h-4 rounded w-1/4 mb-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />
        <div className="flex gap-4">
          <div className={`h-4 rounded w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-4 rounded w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-4 rounded w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>
        <div className={`mt-4 h-12 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className="mt-4 flex flex-wrap gap-4">
          <div className={`h-4 rounded w-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-4 rounded w-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>
        <div className="mt-4 flex gap-4">
          <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>
      </div>
      <div className="flex gap-3 mt-4 px-4">
        <div className={`h-8 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`h-8 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`h-8 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`h-8 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className={`h-8 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </div>
    </div>
  );

  if (profileData === null || profileData === undefined) {
    return <Skeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg mb-6 shadow-sm ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}
    >
      {/* Cover Photo */}
      <div className="h-[200px] w-full overflow-hidden flex justify-between items-center shadow-sm">
        <img
          src={profileData.cover}
          alt="Cover Photo"
          className="min-w-full min-h-full object-cover"
        />
      </div>
      
      <div className="relative px-6 pt-4 pb-4">
        {/* Profile Picture and Info */}
        <div className="flex items-end gap-4">
          <div className={`h-[100px] w-[100px] rounded-full shadow-lg overflow-hidden relative border-4 ${
            darkMode ? 'border-gray-900' : 'border-white'
          } -mt-14`}>
            <img
              src={profileData.profile}
              alt="Profile"
              className="min-w-full min-h-full object-cover rounded-full"
            />
            <div
              className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 ${
                isUserOnline(profileData._id) 
                  ? (darkMode ? 'bg-green-500 border-gray-900' : 'bg-green-500 border-white') 
                  : (darkMode ? 'bg-red-500 border-gray-900' : 'bg-red-500 border-white')
              }`}
            ></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl font-semibold ${
                darkMode ? 'text-gray-100' : 'text-neutral-800'
              }`}>
                {profileData.fullName}
              </h1>
              {profileData.verify && (
                <VerifiedBadge isVerified={profileData.verify} darkMode={darkMode} />
              )}
            </div>
            <h3 className={`text-base font-normal ${
              darkMode ? 'text-gray-400' : 'text-neutral-600'
            }`}>
              @{profileData.username}
            </h3>
          </div>
        </div>
        
        {/* Last Active Status */}
        {!isUserOnline(profileData._id) && (
          <p className={`text-sm font-medium mt-1 ${
            darkMode ? 'text-red-400' : 'text-red-500'
          }`}
            title={new Date(profileData?.lastActive).toLocaleString()}
          >
            Last active: {formatLastActive(profileData?.lastActive)}
          </p>
        )}

        {/* Followers and Following */}
        <div className={`flex gap-4 text-sm font-medium mt-3 ${
          darkMode ? 'text-gray-400' : 'text-gray-700'
        }`}>
          <span>👥 <strong>{profileData.followers}</strong> Followers</span>
          <span>•</span>
          <span>🔄 <strong>{profileData.following}</strong> Following</span>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          {user === myUser ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => set_edit_profile_Ui_Control(true)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Edit Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLogoutModel(true)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {signOutLoading ? (
                  <div className="loader-dark" />
                ) : (
                  <>
                    <FaSignOutAlt /> Logout
                  </>
                )}
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  setLoader(true);
                  const res = await flowReq(profileData._id);
                  if (res) {
                    await readProfileReq(user);
                    toast.success("Success!");
                  } else {
                    toast.error("Failed!");
                  }
                  setLoader(false);
                }}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  profileData.isFollowing
                    ? (darkMode 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                      : 'bg-sky-500 text-white hover:bg-sky-600')
                    : (darkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                {loader ? <LoadingButtonFit darkMode={darkMode} /> : (profileData.isFollowing ? "Unfollow" : "Follow")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMessageClick(profileData._id)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Message
              </motion.button>
            </>
          )}
        </div>
        
        {/* Bio */}
        <div className={`mt-4 p-3 rounded-lg ${
          darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          {profileData.bio === "" ? (
            <p className={`text-sm italic ${
              darkMode ? 'text-gray-500' : 'text-neutral-600'
            }`}>No bio added yet</p>
          ) : (
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-neutral-700'
            }`}>"{profileData.bio}"</p>
          )}
        </div>
        
        {/* Contact & Social */}
        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-gray-200' : 'text-neutral-800'
          }`}>Contact & Social</h3>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-xl shadow-sm ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50' 
              : 'bg-gradient-to-br from-gray-50 to-gray-100'
          }`}>
            <div className="space-y-4">
              <motion.div
                whileHover={{ y: -5 }}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-sm transition-all duration-300 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <IoCallSharp className={`text-xl ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <p className={`text-xs uppercase ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>Phone</p>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-neutral-800'
                  }`}>
                    {profileData.phone || "Not provided"}
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-sm transition-all duration-300 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <MdEmail className={`text-xl ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <p className={`text-xs uppercase ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>Email</p>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-neutral-800'
                  }`}>
                    {profileData.email || "Not provided"}
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex flex-wrap justify-start lg:justify-end items-center gap-4">
              {profileData.mediaLink?.facebook && (
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className={`p-3 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <FaSquareFacebook
                      className={`text-xl cursor-pointer ${
                        darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-neutral-700 hover:text-blue-600'
                      }`}
                      onClick={() => openNewWindow(profileData.mediaLink.facebook)}
                    />
                  </div>
                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    Facebook
                  </span>
                </motion.div>
              )}
              
              {profileData.mediaLink?.linkedin && (
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className={`p-3 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <IoLogoLinkedin
                      className={`text-xl cursor-pointer ${
                        darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-neutral-700 hover:text-blue-800'
                      }`}
                      onClick={() => openNewWindow(profileData.mediaLink.linkedin)}
                    />
                  </div>
                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    LinkedIn
                  </span>
                </motion.div>
              )}
              
              {profileData.mediaLink?.github && (
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className={`p-3 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <FaGithub
                      className={`text-xl cursor-pointer ${
                        darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-neutral-700 hover:text-gray-900'
                      }`}
                      onClick={() => openNewWindow(profileData.mediaLink.github)}
                    />
                  </div>
                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    GitHub
                  </span>
                </motion.div>
              )}
              
              {profileData.mediaLink?.fiver && (
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className={`p-3 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <TbBrandFiverr
                      className={`text-xl cursor-pointer ${
                        darkMode ? 'text-gray-400 hover:text-green-400' : 'text-neutral-700 hover:text-green-600'
                      }`}
                      onClick={() => openNewWindow(profileData.mediaLink.fiver)}
                    />
                  </div>
                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    Fiverr
                  </span>
                </motion.div>
              )}
              
              {!profileData.mediaLink?.facebook &&
                !profileData.mediaLink?.linkedin &&
                !profileData.mediaLink?.github &&
                !profileData.mediaLink?.fiver && (
                  <p className={`text-sm italic animate-pulse ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>No social presence yet</p>
                )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className={`flex flex-row gap-3 w-full overflow-x-auto scroll-bar-hidden cursor-pointer mt-6 pt-4 ${
          darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
        }`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => set_profile_tab("my-post")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
              profile_tab === "my-post"
                ? (darkMode 
                  ? 'bg-cyan-900/30 text-cyan-400' 
                  : 'bg-blue-100 text-blue-600')
                : (darkMode 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            My Post
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => set_profile_tab("post-photo")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
              profile_tab === "post-photo"
                ? (darkMode 
                  ? 'bg-cyan-900/30 text-cyan-400' 
                  : 'bg-blue-100 text-blue-600')
                : (darkMode 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            Photo
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => set_profile_tab("followers")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
              profile_tab === "followers"
                ? (darkMode 
                  ? 'bg-cyan-900/30 text-cyan-400' 
                  : 'bg-blue-100 text-blue-600')
                : (darkMode 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            Followers
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => set_profile_tab("following")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
              profile_tab === "following"
                ? (darkMode 
                  ? 'bg-cyan-900/30 text-cyan-400' 
                  : 'bg-blue-100 text-blue-600')
                : (darkMode 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            Following
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => set_profile_tab("about")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
              profile_tab === "about"
                ? (darkMode 
                  ? 'bg-cyan-900/30 text-cyan-400' 
                  : 'bg-blue-100 text-blue-600')
                : (darkMode 
                  ? 'text-gray-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100')
            }`}
          >
            About
          </motion.button>
        </div>
      </div>
      
      {/* Logout Modal */}
      {logoutModel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-lg shadow-xl w-[400px] ${
              darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
            }`}
          >
            <h2 className={`text-xl font-semibold text-center mb-4 ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLogoutModel(false)}
                className={`py-2 px-4 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`py-2 px-4 rounded transition-colors ${
                  darkMode 
                    ? 'bg-red-700 text-white hover:bg-red-600' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserInfo;