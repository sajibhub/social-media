import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import authorStore from "../store/authorStore";
import uiManage from "../store/uiManage";
import { FaTimes, FaUser, FaImage } from "react-icons/fa";

const UpdateProfilePopup = () => {
  const { set_edit_profile_Ui_Control } = uiManage();
  const { setProfileUpdateData, profileUpdateData, updateProfileRuq, readProfileReq } = authorStore();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const updateHandel = async () => {
    const profile = profileUpdateData["profile"];
    const cover = profileUpdateData["cover"];
    
    if (!profile && !cover) {
      toast.error("Please select at least one image to upload");
      return;
    }

    setLoading(true);
    const res = await updateProfileRuq(cover, profile);
    setLoading(false);
    
    if (res) {
      set_edit_profile_Ui_Control(null);
      toast.success("Updated profile successfully");
      await readProfileReq("me");
    } else {
      toast.error("Error updating profile");
    }
  };

  const closePopup = () => {
    set_edit_profile_Ui_Control(null);
  };

  // File upload component to reduce code duplication
  const FileUpload = ({ id, label, icon, onChange }) => (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium mb-2 ${
          darkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          onChange={onChange}
          type="file"
          id={id}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer ${
            darkMode 
              ? "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50" 
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className={`p-2 rounded-full ${
            darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
          }`}>
            {icon}
          </div>
          <span className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Choose file
          </span>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      darkMode ? "bg-black/70 backdrop-blur-sm" : "bg-black bg-opacity-50"
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-md rounded-xl shadow-2xl p-6 relative ${
          darkMode ? "bg-gradient-to-b from-gray-800 to-gray-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}>
            Upload Photos
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={closePopup}
            className={`p-2 rounded-full ${
              darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            <FaTimes />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6">
          {/* Upload Cover Photo */}
          <FileUpload
            id="uploadCover"
            label="Upload Cover Photo"
            icon={<FaImage />}
            onChange={(e) => setProfileUpdateData("cover", e.target.files[0])}
          />

          {/* Upload Profile Photo */}
          <FileUpload
            id="uploadProfile"
            label="Upload Profile Photo"
            icon={<FaUser />}
            onChange={(e) => setProfileUpdateData("profile", e.target.files[0])}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={closePopup}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Cancel
          </motion.button>
          
          {loading ? (
            <div className="loader-dark my-2 mx-3"></div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={updateHandel}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                darkMode 
                  ? "bg-cyan-600 text-white hover:bg-cyan-500" 
                  : "bg-sky-600 text-white hover:bg-sky-700"
              }`}
            >
              Save
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UpdateProfilePopup;