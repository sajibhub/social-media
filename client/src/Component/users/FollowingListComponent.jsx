import { motion } from "framer-motion";
import authorStore from "@/store/authorStore.js";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {useEffect, useState} from "react";
import VerifiedBadge from "../utility/VerifyBadge.jsx";

const SearchResultComponent = () => {
  const userName = localStorage.getItem("userName");
  const { user } = useParams();
  const navigate = useNavigate();
  const [followLoader, setFollowLoader] = useState({ status: false, id: null });

  const { followingList, flowReq, followingListReq, readProfileReq ,clear_followingList, } =
    authorStore();

  useEffect(() => {
    (
        async () => {
          clear_followingList()
          await followingListReq(user);
        }
    )()
  },[user])


  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  const followHandler = async (id) => {
    setFollowLoader({ status: true, id });
    const res = await flowReq(id);
    setFollowLoader({ status: false, id: null });

    if (res) {
      await readProfileReq(user);
      await followingListReq(user === "me" ? userName : user);
      toast.success("Action Successful");
    } else {
      toast.error("Action Failed");
    }
  };

  const skeletonLoader = Array.from({ length: 7 }).map((_, index) => (
    <motion.div
      key={index}
      className="flex items-center gap-4 p-4 border rounded-lg shadow-md animate-pulse bg-white"
    >
      <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
      <div className="flex flex-col flex-grow space-y-2">
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
      </div>
      <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
    </motion.div>
  ));

  return (
    <div className=" px-3 space-y-4">
      {followingList === null
        ? skeletonLoader
        : followingList.map((user, i) => (
            <motion.div
              key={i}
              whileHover={{ opacity: 1, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                scale: { type: "spring", stiffness: 300 },
              }}
              className="cursor-pointer flex flex-col items-end lg:flex-row justify-start lg:items-center gap-4 p-4 border rounded-lg shadow-lg mb-2 bg-white hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-start items-center gap-3 w-full">
                <div
                    onClick={() => goToProfile(user.username)}
                    className="h-[50px] w-[50px] flex items-center justify-center rounded-full overflow-hidden border-2 border-gray-200"
                >
                  <img
                      src={user.profile}
                      alt={`${user.fullName} profile`}
                      className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow cursor-pointer">
                  <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-1">
                  <span
                      onClick={() => goToProfile(user.username)}
                      className="cursor-pointer hover:underline"
                  >
                    {user.fullName}
                  </span>
                    {user.verify && <VerifiedBadge isVerified={user.verify}/>}
                  </h2>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>

              {followLoader.id === user._id ? (
                  <div className="loader-dark w-8 h-8"></div>
              ) : (
                  <button
                      onClick={() => followHandler(user._id)}
                      className={`text-sm font-medium py-2 px-6 rounded-full transition-all ${
                          user.isFollowing
                              ? "bg-sky-500 text-white hover:bg-sky-600"
                              : "bg-red-500 text-white hover:bg-red-600" 
                      }`}
                  >
                    Unfollow
                  </button>
              )}
            </motion.div>
          ))}

      <div className="py-[45px]"></div>
    </div>
  );
};

export default SearchResultComponent;
