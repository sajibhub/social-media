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
    if (!myId) {
      toast.error("You must be logged in to start a chat");
      return;
    }
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("conversationCreated", { senderId: myId, receiverId });
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
    socket.on("conversationCreated", handleNewConversation);
    return () => socket.off("conversationCreated", handleNewConversation);
  }, [navigate]);

  if (!profileData) {
    return (
      <div className="rounded-xl border border-gray-200 mb-6 animate-pulse bg-white shadow-sm">
        <div className="h-48 w-full bg-gray-200 rounded-t-xl" />
        <div className="relative px-6 -mt-16">
          <div className="h-32 w-32 rounded-full bg-gray-200 border-4 border-white" />
          <div className="mt-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 mb-6 bg-white shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 w-full relative">
        <img
          src={profileData.cover}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content */}
      <div className="relative px-6 -mt-16">
        {/* Profile Picture */}
        <div className="relative inline-block">
          <img
            src={profileData.profile}
            alt="Profile"
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
          />
          <span
            className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white ${
              isUserOnline(profileData?._id) ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>

        {/* User Info */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              {profileData.fullName}
            </h1>
            {profileData.verify && <VerifiedBadge isVerified={true} />}
          </div>
          <p className="text-gray-600">@{profileData.username}</p>
          
          {/* Stats */}
          <div className="flex gap-4 text-gray-600 mt-2 text-sm">
            <span>👥 {profileData.followers} Followers</span>
            <span>🔄 {profileData.following} Following</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
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
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    profileData.isFollowing
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

          {/* Bio */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 text-sm">
              {profileData.bio || "No bio available"}
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <IoCallSharp />
              <span>{profileData.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MdEmail />
              <span>{profileData.email}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-4 flex gap-4">
            {profileData.mediaLink?.facebook && (
              <FaSquareFacebook
                className="text-xl text-gray-600 hover:text-blue-600 cursor-pointer"
                onClick={() => openNewWindow(profileData.mediaLink.facebook)}
              />
            )}
            {profileData.mediaLink?.linkedin && (
              <IoLogoLinkedin
                className="text-xl text-gray-600 hover:text-blue-800 cursor-pointer"
                onClick={() => openNewWindow(profileData.mediaLink.linkedin)}
              />
            )}
            {profileData.mediaLink?.github && (
              <FaGithub
                className="text-xl text-gray-600 hover:text-gray-900 cursor-pointer"
                onClick={() => openNewWindow(profileData.mediaLink.github)}
              />
            )}
            {profileData.mediaLink?.fiver && (
              <TbBrandFiverr
                className="text-xl text-gray-600 hover:text-green-500 cursor-pointer"
                onClick={() => openNewWindow(profileData.mediaLink.fiver)}
              />
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-t pt-4 flex gap-2 overflow-x-auto">
            {["my-post", "post-photo", "followers", "following", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => set_profile_tab(tab)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  profile_tab === tab
                    ? "bg-sky-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.replace("-", " ").charAt(0).toUpperCase() + tab.replace("-", " ").slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {logoutModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Confirm Logout
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setLogoutModel(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {signOutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;