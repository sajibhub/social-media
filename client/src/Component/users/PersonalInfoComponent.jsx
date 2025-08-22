import { useState, useEffect } from "react";
import authorStore from "../../store/authorStore";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const PersonalInfoComponent = () => {
  const { user } = useParams();
  let myUser = localStorage.getItem("userName");
  const {
    myProfileData,
    profileData,
    updateProfileData,
    updateProfileReq,
    readProfileReq,
  } = authorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const handleProfileUpdate = async () => {
    setLoading(true);
    let reqData = "";
    if (myProfileData.username === profileData.username) {
      reqData = {
        fullName: myProfileData.fullName,
        email: myProfileData.email,
        phoneNumber: myProfileData.phoneNumber,
        bio: myProfileData.bio,
        location: myProfileData.location,
        profession: myProfileData.profession,
      };
    } else {
      reqData = {
        username: myProfileData.username,
        fullName: myProfileData.fullName,
        email: myProfileData.email,
        phoneNumber: myProfileData.phoneNumber,
        bio: myProfileData.bio,
        location: myProfileData.location,
      };
    }
    const res = await updateProfileReq(reqData);
    setIsEditing(false);
    setLoading(false);
    if (res) {
      toast.success("Profile Updated Successfully");
      await readProfileReq("me");
    } else {
      toast.error("Profile Update Failed");
    }
  };

  // Skeleton loading component
  const Skeleton = () => (
    <div className={`py-8 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`shadow-md rounded-lg p-6 max-w-3xl mx-auto animate-pulse ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`h-6 rounded w-1/3 mb-6 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
        <div className="space-y-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className={`h-4 rounded w-1/3 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
              <div className={`h-8 rounded w-2/3 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <div className={`h-10 rounded w-24 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className={`h-10 rounded w-24 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
        </div>
      </div>
    </div>
  );

  if (profileData === null || myProfileData === null) {
    return <Skeleton />;
  }

  // Form field component to reduce code duplication
  const FormField = ({ label, value, field, type = "text", isTextarea = false }) => (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`flex justify-between items-start ${isTextarea ? 'flex-col lg:flex-row lg:items-center' : ''}`}
    >
      <label className={`font-medium w-1/3 ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}:
      </label>
      {isEditing ? (
        isTextarea ? (
          <textarea
            name={field}
            value={value}
            onChange={(e) => updateProfileData(field, e.target.value)}
            className={`w-full mt-2 lg:mt-0 lg:w-2/3 px-4 py-3 rounded-lg focus:outline-none transition ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-cyan-500' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-sky-500'
            } border focus:ring-2`}
            rows="4"
          />
        ) : (
          <input
            type={type}
            name={field}
            value={value}
            onChange={(e) => updateProfileData(field, e.target.value)}
            className={`w-2/3 px-4 py-3 rounded-lg focus:outline-none transition ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-cyan-500' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-sky-500'
            } border focus:ring-2`}
          />
        )
      ) : (
        <p className={`w-full lg:w-2/3 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {value || "Not provided"}
        </p>
      )}
    </motion.div>
  );

  return (
    <div className={`pb-3 ${darkMode ? 'bg-gray-900' : ''}`}>
      {/* Personal Info Form */}
      <div className={`border-b p-4 lg:p-8 max-w-3xl mx-auto ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-2xl font-semibold mb-6 ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Personal Information
        </h2>
        <div className="space-y-6">
          {/* User Name */}
          <FormField
            label="User Name"
            value={myUser === user ? myProfileData?.username : profileData?.username}
            field="username"
          />
          
          {/* Full Name */}
          <FormField
            label="Full Name"
            value={myUser === user ? myProfileData?.fullName : profileData?.fullName}
            field="fullName"
          />
          
          {/* Email */}
          <FormField
            label="Email"
            value={myUser === user ? myProfileData?.email : profileData?.email}
            field="email"
            type="email"
          />
          
          {/* Profession */}
          <FormField
            label="Profession"
            value={myUser === user ? myProfileData?.profession : profileData?.profession}
            field="profession"
          />
          
          {/* Phone */}
          <FormField
            label="Phone"
            value={myUser === user ? myProfileData?.phone : profileData?.phone}
            field="phone"
          />
          
          {/* Bio */}
          <FormField
            label="Bio"
            value={myUser === user ? myProfileData?.bio : profileData?.bio}
            field="bio"
            isTextarea={true}
          />
          
          {/* Address */}
          <FormField
            label="Address"
            value={myUser === user ? myProfileData?.location : profileData?.location}
            field="location"
          />
        </div>
        
        {/* Edit/Save Buttons */}
        {myUser === user && (
          <div className="mt-8 flex justify-end gap-6">
            {isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProfileUpdate}
                className={`px-4 py-2 text-sm rounded-lg transition ease-in-out duration-300 ${
                  darkMode 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                {loading ? <div className="loader"></div> : "Save Changes"}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 text-base rounded-lg transition ease-in-out duration-300 ${
                  darkMode 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                Edit Profile
              </motion.button>
            )}
            
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 text-sm rounded-lg transition ease-in-out duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoComponent;