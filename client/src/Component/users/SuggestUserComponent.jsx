import { motion } from "framer-motion";
import authorStore from "@/store/authorStore.js";
import { useEffect, useState } from "react";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import useActiveStore from "@/store/useActiveStore.js";

const SuggestUserComponent = () => {
  const navigate = useNavigate();
  const [followLoader, setFollowLoader] = useState({ status: false, id: null });
  const { suggestUser, suggestUserReq, flowReq, update_suggestUser } = authorStore();
  
  // Get online status for users from Zustand store
  const { isUserOnline } = useActiveStore(); 

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

  return (
    <div className="mt-6 mx-4">
      <h1 className="mb-4 text-lg font-semibold text-neutral-800">Suggested For You</h1>

      {suggestUser === null && (
        <>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg mb-4 bg-white shadow animate-pulse"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
        </>
      )}

      {suggestUser !== null && (
        <div className="space-y-2">
          {suggestUser.map((user, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
              className="flex items-center gap-2 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md"
            >
              <div className="relative">
                <div
                  onClick={() => goToProfile(user.username)}
                  className="h-16 w-16 rounded-full overflow-hidden cursor-pointer border border-gray-300"
                >
                  <img
                    src={user.profile}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Online/Offline Status Indicator */}
                <div
                  className={`absolute bottom-1 right-0 h-4 w-4 rounded-full border-2 ${isUserOnline(user._id) ? 'bg-green-500 border-white' : 'bg-red-500 border-white'}`}
                ></div>
              </div>

              <div className="flex-grow">
                <h2
                  onClick={() => goToProfile(user.username)}
                  className="text-base font-semibold text-neutral-900 cursor-pointer hover:underline"
                >
                  {user.fullName}
                </h2>
                {user.verify && <VerifiedBadge isVerified={user.verify} />}
                <p className="text-sm text-neutral-600">{user.username}</p>
              </div>

              <div>
                {followLoader.status && followLoader.id === user._id ? (
                  <LoadingButtonFit />
                ) : (
                  <button
                    onClick={() => followHandel(user._id, user.isFollowing)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 focus:outline-none ${
                      user.isFollowing
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestUserComponent;
