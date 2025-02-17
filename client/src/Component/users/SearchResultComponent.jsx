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

  const { searchUserReq, searchUserData, flowReq, searchKeywords } =
    authorStore();

  const goToProfile = (user) => {
    navigate("/profile/" + user);
  };

  const followHandel = async (id) => {
    setFollowLoader({ status: true, id: id });
    let res = await flowReq(id);
    setFollowLoader({ status: false, id: null });
    if (res) {
      toast.success("Following Successful");
      await searchUserReq(searchKeywords);
    } else {
      toast.error("Following Failed");
    }
  };

  if (searchUserData === null) {
    // Placeholder for loading users
    return (
      <div className="mt-4 px-3">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <motion.div
            key={i}
            className="flex flex-row items-center gap-3 p-3 border rounded mb-4 animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-grow">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </motion.div>
        ))}
      </div>
    );
  }

  else {
    return (
      <div className="mt-4 px-3">
        {searchUserData.map((user, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.3,
              scale: { type: "spring", stiffness: 200 },
            }}
            className="flex flex-col  lg:flex-row lg:items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-lg bg-white mb-4"
          >
            {/* Profile Picture */}
            <div className="flex gap-3 items-center justify-center w-full lg:w-fit">
              <div
                  onClick={() => goToProfile(user.username)}
                  className="flex-shrink-0 h-12 w-12 lg:h-14 lg:w-14 rounded-full overflow-hidden cursor-pointer border border-gray-200"
              >
                <img
                    src={user.profile}
                    alt={user.fullName}
                    className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-grow lg:hidden">
                <h2 className="text-lg font-medium text-neutral-900 flex items-center gap-1">
                <span
                    onClick={() => goToProfile(user.username)}
                    className="cursor-pointer hover:underline"
                >
                  {user.fullName}
                </span>
                  {user.verify && <VerifiedBadge isVerified={user.verify}/>}
                </h2>
                <p className="text-sm text-neutral-600">
                  Followers: {user.followers}
                </p>
              </div>

            </div>

            <div className="flex-grow">
              <h2 className="text-lg font-medium text-neutral-900 hidden lg:flex items-center gap-1 ">
                <span
                    onClick={() => goToProfile(user.username)}
                    className="cursor-pointer hover:underline"
                >
                  {user.fullName}
                </span>
                {user.verify && <VerifiedBadge isVerified={user.verify}/>}
              </h2>
              <p className="text-sm text-neutral-600 hidden lg:inline-block">
                Followers: {user.followers}
              </p>
              <p className="text-sm text-neutral-600">{user.bio}</p>
            </div>

            {/* Follow Button */}
            <div >
              {followLoader.id === user._id ? (
                <LoadingButtonFit className="px-4 py-2 bg-blue-500 text-white rounded-lg" />
              ) : (
                <button
                  onClick={() => followHandel(user._id)}
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
  }
};

export default SearchResultComponent;
