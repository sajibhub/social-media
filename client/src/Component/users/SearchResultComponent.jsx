import { motion } from "framer-motion";
import authorStore from "@/store/authorStore.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import VerifiedBadge from "../utility/VerifyBadge.jsx";

const SearchResultComponent = () => {
  const navigate = useNavigate();
  const [followLoader, setFollowLoader] = useState({ status: false, id: null });
  const { searchUserReq, searchUserData, flowReq, searchKeywords } = authorStore();

  const goToProfile = (username) => navigate(`/profile/${username}`);

  const followHandle = async (id) => {
    setFollowLoader({ status: true, id });
    const res = await flowReq(id);
    setFollowLoader({ status: false, id: null });

    if (res) {
      toast.success("Following Successful");
      await searchUserReq(searchKeywords);
    } else {
      toast.error("Following Failed");
    }
  };

  if (searchUserData === null) {
    return (
      <div className="mt-4 px-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 p-4 border rounded-lg shadow-sm animate-pulse bg-gray-100"
          >
            <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
            <div className="flex-grow">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 px-3 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {searchUserData.map((user) => (
        <motion.div
          key={user._id}
          whileHover={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, scale: { type: "spring", stiffness: 200 } }}
          className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md bg-white"
        >
          {/* Profile Picture */}
          <div className="relative cursor-pointer" onClick={() => goToProfile(user.username)}>
            <img
              src={user.profile || '/default-avatar.png'}
              alt={user.fullName}
              className="h-16 w-16 rounded-full object-cover border border-gray-200"
            />
            {user.verify && (
              <div className="absolute bottom-0 right-0">
                <VerifiedBadge isVerified={user.verify} />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="text-center">
            <h2
              className="text-lg font-medium text-neutral-900 cursor-pointer hover:underline break-words text-center"
              onClick={() => goToProfile(user.username)}
            >
              {user.fullName}
            </h2>

            <p className="text-sm text-neutral-600">Followers: {user.followers}</p>

            {/* Display Full Bio */}
            <p className="text-sm text-neutral-500">{user.bio || "No bio available"}</p>
          </div>

          {/* Follow Button */}
          <div>
            {followLoader.id === user._id ? (
              <LoadingButtonFit className="px-4 py-2 bg-blue-500 text-white rounded-lg" />
            ) : (
              <button
                onClick={() => followHandle(user._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none"
              >
                Follow
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SearchResultComponent;
