import { motion } from "framer-motion";
import authorStore from "@/store/authorStore.js";
import VerifiedBadge from "../VerifyBadge/VerifyBadge";
import { useNavigate } from "react-router-dom";

const ProfileSummaryComponent = () => {
  const { myProfileData } = authorStore();
  const navigate = useNavigate();

  const goToProfile = (user) => {
    navigate("/profile/" + user);
  };

  if (!myProfileData) {
    return (
      <div className="mx-2 mt-2 rounded-lg border shadow-lg overflow-hidden animate-pulse bg-gray-50">
        <div className="h-[100px] w-full bg-gray-300 shadow"></div>

        <div className="h-[70px] w-[70px] rounded-full bg-gray-300 mx-[10px] mt-[-35px] shadow"></div>

        <div className="mx-[15px] pb-3 mt-3 space-y-2">
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  } else {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mx-2 mt-2 rounded-lg border shadow-lg overflow-hidden bg-white"
      >
        <div className="h-[100px] w-full overflow-hidden flex flex-row justify-between items-center">
          <img
            src={myProfileData.cover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="h-[70px] w-[70px] rounded-full overflow-hidden mx-[10px] mt-[-35px] shadow border-2 border-blue-500">
          <img
            src={myProfileData.profile}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mx-[15px] pb-3 mt-3">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-1">
            <span
              onClick={() => goToProfile(myProfileData.username)}
              className="cursor-pointer hover:underline"
            >
              {myProfileData.fullName}
            </span>
            {myProfileData.verify && (
              <VerifiedBadge isVerified={myProfileData.verify} />
            )}
          </h1>
          <h3 className="text-sm font-medium text-gray-500">
            @{myProfileData.username}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {myProfileData.profession || "Software Engineer"}
          </p>
        </div>

        <div className="mx-[15px] mb-3 space-y-1">
          <p className="text-sm text-gray-700">
            📍 {myProfileData.location || "San Francisco, USA"}
          </p>
          <p className="text-sm text-gray-700">
            👥 {myProfileData.connections || "500+"} Connections
          </p>
        </div>

        <div className="mx-[15px] pb-3 flex justify-between">
          <button
            onClick={() => navigate("/profile/me")}
            className="px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View Profile
          </button>
          <button className="px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Message
          </button>
        </div>
      </motion.div>
    );
  }
};

export default ProfileSummaryComponent;
