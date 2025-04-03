import authorStore from "@/store/authorStore.js";
import { MdEmail } from "react-icons/md";
import { IoCallSharp } from "react-icons/io5";
import { FaSquareFacebook } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io";
import { TbBrandFiverr } from "react-icons/tb";
import { FaGithub, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import uiManage from "@/store/uiManage.js";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import useActiveStore from '../../store/useActiveStore.js'
import { socket } from "../../utils/socket.js";

const UserInfo = () => {
  const { SignOutReq } = authorStore();
  const navigate = useNavigate();
  const { isUserOnline } = useActiveStore();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [logoutModel, setLogoutModel] = useState(false);
  const { user } = useParams();
  const myUser = localStorage.getItem("userName");
  const myId = localStorage.getItem("id");
  const { profileData, flowReq, readProfileReq } = authorStore();
  const { set_profile_tab, profile_tab, set_edit_profile_Ui_Control } = uiManage();

  const openNewWindow = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMessageClick = (receiverId) => {

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("conversationCreated", { receiverId });
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

  if (profileData === null || profileData === undefined) {
    return (
      <div className="rounded border border-gray-200 mb-6 animate-pulse">
        {/* Loading Skeleton */}
        <div className="h-[200px] w-full bg-gray-300" />
        <div className="h-[100px] w-[100px] rounded-full bg-gray-300 mx-[25px] mt-[-50px] shadow" />
        <div className="mx-[25px] pb-3 mt-3">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4" />
          <div className="flex gap-4">
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-16" />
          </div>
          <div className="mt-4 h-12 bg-gray-200 rounded" />
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="h-4 bg-gray-300 rounded w-32" />
            <div className="h-4 bg-gray-300 rounded w-32" />
          </div>
          <div className="mt-4 flex gap-4">
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3 mt-4 px-4">
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="rounded border border-gray-200 mb-6">
        <div className="h-[200px] w-full overflow-hidden flex flex-row justify-between items-center shadow">
          <img
            src={profileData.cover}
            alt="Cover Photo"
            className="min-w-full min-h-full"
          />
        </div>
        <div
          className="
      h-[100px] w-[100px] lg:h-[100px] lg:w-[100px] rounded-full
      flex justify-center items-center mx-[25px] mt-[-40px] lg:mt-[-50px] 
      shadow overflow-hidden relative"
        >
          <img
            src={profileData.profile}
            alt="Profile"
            className="min-w-full min-h-full object-cover rounded-full"
          />
          {/* Status Indicator */}
          <div
            className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 ${isUserOnline(profileData._id) ? 'bg-green-500 border-white' : 'bg-red-500 border-white'}`}
          ></div>
        </div>
        <div className="mx-3 lg:mx-[25px] pb-3 mt-3 relative">
          <h1 className="text-2xl font-medium text-neutral-700 flex items-center gap-1">
            {profileData.fullName}
            {profileData.verify && (
              <VerifiedBadge isVerified={profileData.verify} />
            )}
          </h1>

          <h3 className="text-base font-normal text-neutral-700">
            {profileData.username}
          </h3>
        </div>

        {/* followers and following */}

        <div className="flex gap-4 text-gray-700  pl-4 text-sm font-medium">
          <span>👥 Followers: {profileData.followers}</span>
          <span>•</span>
          <span>🔄 Following: {profileData.following}</span>

        </div>

        <div className="mt-4 pl-4 flex gap-8">
          {user === myUser ? (
            <>
              <button
                onClick={() => set_edit_profile_Ui_Control(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setLogoutModel(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
              >
                {signOutLoading ? (
                  <div className="loader-dark" />
                ) : (
                  <>
                    <FaSignOutAlt /> Logout
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
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
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${profileData.isFollowing
                  ? "bg-sky-500 text-white hover:bg-sky-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {loader ? <LoadingButtonFit /> : (profileData.isFollowing ? "Unfollow" : "Follow")}
              </button>
              <button
                onClick={() => handleMessageClick(profileData._id)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Message
              </button>
            </>
          )}
        </div>


        {/* Contact Info */}
        <div className="p-3 my-3 bg-gray-100 rounded">
          {profileData.bio === "" ? (
            <h1 className="text-sm font-medium text-neutral-700">
              Please add bio
            </h1>
          ) : (
            <h1 className="text-sm font-medium text-neutral-700">
              "{profileData.bio}"
            </h1>
          )}
        </div>

        <div className="mt-8">
          {/* Section Header */}
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 ml-4">Contact & Social</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-md">
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="group flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <IoCallSharp className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {profileData.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="group flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                  <MdEmail className="text-purple-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {profileData.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-wrap justify-start lg:justify-end items-center gap-4">
              {profileData.mediaLink?.facebook && (
                <div className="group relative">
                  <div className="p-3 bg-white rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                    <FaSquareFacebook
                      className="text-xl text-neutral-700 hover:text-blue-600 cursor-pointer"
                      onClick={() => openNewWindow(profileData.mediaLink.facebook)}
                    />
                  </div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Facebook
                  </span>
                </div>
              )}
              {profileData.mediaLink?.linkedin && (
                <div className="group relative">
                  <div className="p-3 bg-white rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                    <IoLogoLinkedin
                      className="text-xl text-neutral-700 hover:text-blue-800 cursor-pointer"
                      onClick={() => openNewWindow(profileData.mediaLink.linkedin)}
                    />
                  </div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    LinkedIn
                  </span>
                </div>
              )}
              {profileData.mediaLink?.github && (
                <div className="group relative">
                  <div className="p-3 bg-white rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                    <FaGithub
                      className="text-xl text-neutral-700 hover:text-gray-900 cursor-pointer"
                      onClick={() => openNewWindow(profileData.mediaLink.github)}
                    />
                  </div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    GitHub
                  </span>
                </div>
              )}
              {profileData.mediaLink?.fiver && (
                <div className="group relative">
                  <div className="p-3 bg-white rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-110">
                    <TbBrandFiverr
                      className="text-xl text-neutral-700 hover:text-green-600 cursor-pointer"
                      onClick={() => openNewWindow(profileData.mediaLink.fiver)}
                    />
                  </div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Fiverr
                  </span>
                </div>
              )}
              {/* Fallback for no social links */}
              {!profileData.mediaLink?.facebook &&
                !profileData.mediaLink?.linkedin &&
                !profileData.mediaLink?.github &&
                !profileData.mediaLink?.fiver && (
                  <p className="text-sm text-gray-500 italic animate-pulse">No social presence yet</p>
                )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-row gap-3 w-full overflow-x-auto scroll-bar-hidden cursor-pointer">
          <button
            onClick={() => set_profile_tab("my-post")}
            className={`
              flex-shrink-0
              ${profile_tab === "my-post" ? "profile-tab-active" : "profile-tab"}
            `}
          >
            My Post
          </button>
          <button
            onClick={() => set_profile_tab("post-photo")}
            className={`
              flex-shrink-0
              ${profile_tab === "post-photo" ? "profile-tab-active" : "profile-tab"}
            `}
          >
            Photo
          </button>
          <button
            onClick={() => set_profile_tab("followers")}
            className={`
              flex-shrink-0
              ${profile_tab === "followers" ? "profile-tab-active" : "profile-tab"}
            `}
          >
            Followers
          </button>
          <button
            onClick={() => set_profile_tab("following")}
            className={`
              flex-shrink-0
              ${profile_tab === "following" ? "profile-tab-active" : "profile-tab"}
            `}
          >
            Following
          </button>
          <button
            onClick={() => set_profile_tab("about")}
            className={`
              flex-shrink-0
              ${profile_tab === "about" ? "profile-tab-active" : "profile-tab"}
            `}
          >
            About
          </button>
        </div>

        {/* Logout Modal */}
        {logoutModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
              <h2 className="text-xl font-semibold text-center mb-4">
                Are you sure you want to log out?
              </h2>
              <div className="flex justify-between">
                <button
                  onClick={() => setLogoutModel(false)}
                  className="bg-gray-300 text-neutral-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default UserInfo;
