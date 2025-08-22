import { useState, useEffect } from "react";
import { FaFacebookF, FaGit, FaLinkedinIn } from "react-icons/fa";
import authorStore from "../../store/authorStore.js";
import toast from "react-hot-toast";
import { TbBrandFiverr } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const SocialMediaComponent = () => {
  const { user } = useParams();
  let userName = localStorage.getItem('userName');
  const { myProfileData, updateProfileReq, updateMediaLinkValue, profileData } = authorStore();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const toggleEdit = (platform, url) => {
    setEditData(url);
    setEditing(platform);
  };

  const visit = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleProfileUpdate = async (icon) => {
    updateMediaLinkValue(icon, editData);
    setLoading(true);
    let reqData = "";

    if (icon === "facebook") {
      reqData = {
        facebook: editData,
      };
    }

    if (icon === "linkedin") {
      reqData = {
        linkedin: editData,
      };
    }

    if (icon === "fiver") {
      reqData = {
        fiver: editData,
      };
    }

    if (icon === "github") {
      reqData = {
        github: editData,
      };
    }

    const res = await updateProfileReq(reqData);
    setLoading(false);
    setEditData("");
    if (res) {
      toggleEdit(false);
      toast.success("Profile Updated Successfully");
    } else {
      toast.error("Profile Update Failed");
    }
  };

  // Skeleton loading component
  const Skeleton = () => (
    <div className="px-4 lg:px-8 border-b pb-8">
      <h2 className={`text-xl mt-4 lg:mt-8 font-semibold mb-4 text-center animate-pulse ${
        darkMode ? 'bg-gray-700 h-8 w-64 mx-auto rounded' : 'bg-gray-200 h-8 w-64 mx-auto rounded'
      }`}></h2>
      <div className="space-y-4 pt-2">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`flex flex-wrap justify-center items-center gap-4 p-4 rounded-md shadow-sm animate-pulse ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
            } border`}
          >
            <div className={`h-8 w-8 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`flex-grow h-4 rounded ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-8 w-16 rounded ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-8 w-16 rounded ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (myProfileData == null || profileData == null) {
    return <Skeleton />;
  }

  // Get the appropriate profile data based on whether viewing own profile or someone else's
  const getMediaLink = (platform) => {
    if (userName === user) {
      return myProfileData.mediaLink[platform] || "";
    } else {
      return profileData.mediaLink?.[platform] || "";
    }
  };

  const SocialMediaItem = ({ icon: Icon, platform, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-wrap justify-center items-center gap-4 p-4 rounded-lg shadow-sm border transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:shadow-lg' 
          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:shadow-md'
      }`}
    >
      <Icon className={`text-2xl flex-shrink-0 ${color}`} />
      
      {editing === platform ? (
        <motion.input
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="text"
          value={editData}
          onChange={(e) => setEditData(e.target.value)}
          className={`flex-grow bg-transparent outline-none text-sm placeholder-gray-400 border-b-2 focus:outline-none ${
            darkMode 
              ? 'border-gray-600 focus:border-cyan-400 text-gray-200' 
              : 'border-gray-300 focus:border-blue-500 text-gray-700'
          }`}
          placeholder={`Add ${platform} link...`}
        />
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-grow text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {getMediaLink(platform) || `Add ${platform} link`}
        </motion.span>
      )}
      
      {editing === platform ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleProfileUpdate(platform)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            darkMode 
              ? 'bg-green-600 text-white hover:bg-green-500' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {loading ? <div className="loader"></div> : "Save"}
        </motion.button>
      ) : (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => visit(getMediaLink(platform))}
            disabled={!getMediaLink(platform)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              getMediaLink(platform)
                ? (darkMode 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                  : 'bg-blue-500 text-white hover:bg-blue-600')
                : (darkMode 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed')
            }`}
          >
            Visit
          </motion.button>
          
          {user === userName && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleEdit(platform, getMediaLink(platform))}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                  : 'bg-gray-300 text-neutral-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Edit
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="px-4 lg:px-8 border-b pb-8">
      <h2 className={`text-xl mt-4 lg:mt-8 font-semibold mb-4 text-center ${
        darkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>Manage Social Media Links</h2>
      
      <div className="space-y-4 pt-2">
        <SocialMediaItem 
          icon={FaFacebookF} 
          platform="facebook" 
          color={darkMode ? "text-blue-400" : "text-sky-500"} 
        />
        
        <SocialMediaItem 
          icon={FaLinkedinIn} 
          platform="linkedin" 
          color={darkMode ? "text-blue-400" : "text-sky-500"} 
        />
        
        <SocialMediaItem 
          icon={TbBrandFiverr} 
          platform="fiver" 
          color={darkMode ? "text-green-400" : "text-green-500"} 
        />
        
        <SocialMediaItem 
          icon={FaGit} 
          platform="github" 
          color={darkMode ? "text-gray-300" : "text-gray-800"} 
        />
      </div>
    </div>
  );
};

export default SocialMediaComponent;