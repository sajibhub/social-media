import authorStore from "@/store/authorStore.js";
import { MdEmail } from "react-icons/md";
import { IoCallSharp } from "react-icons/io5";
import { FaSquareFacebook } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io";
import { TbBrandFiverr } from "react-icons/tb";
import { FaGithub } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import uiManage from "@/store/uiManage.js";
import VerifiedBadge from "../utility/VerifyBadge.jsx";

const UserInfo = () => {
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const { user } = useParams();
  let myUser = localStorage.getItem("userName");
  const { profileData, flowReq, readProfileReq } = authorStore();
  const { set_profile_tab, profile_tab, set_edit_profile_Ui_Control } =
    uiManage();

  const openNewWindow = (url) => {
    let  newUrl = "https://" + url;
    window.open(newUrl, "_blank", "noopener,noreferrer");
  };

  if (profileData === null || profileData === undefined) {
    return (
      <div className="rounded border border-gray-200 mb-6 animate-pulse">
        {/* Cover Photo Skeleton */}
        <div className="h-[200px] w-full bg-gray-300" />

        {/* Profile Picture Skeleton */}
        <div className="h-[100px] w-[100px] rounded-full bg-gray-300 mx-[25px] mt-[-50px] shadow" />

        <div className="mx-[25px] pb-3 mt-3">
          {/* Name Skeleton */}
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-2" />

          {/* Username Skeleton */}
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4" />

          {/* Follow Stats Skeleton */}
          <div className="flex gap-4">
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-16" />
          </div>

          {/* Bio Skeleton */}
          <div className="mt-4 h-12 bg-gray-200 rounded" />

          {/* Contact Info Skeleton */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="h-4 bg-gray-300 rounded w-32" />
            <div className="h-4 bg-gray-300 rounded w-32" />
          </div>

          {/* Social Media Icons Skeleton */}
          <div className="mt-4 flex gap-4">
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-3 mt-4 px-4">
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
          <div className="h-8 w-24 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }

  else {
    return (
      <div className=" rounded  border border-gray-200 mb-6">
        <div className="h-[200px] w-full overflow-hidden flex flex-row justify-between items-center shadow ">
          <img
            src={profileData.cover}
            alt="Cover Photo"
            className="min-w-full min-h-full"
          />
        </div>
        <div
          className="
                    h-[80px] w-[80px] lg:h-[100px] lg:w-[100px] rounded-full overflow-hidden flex flex-row
                     justify-between items-center mx-[25px] mt-[-40px] lg:mt-[-50px] shadow
                     "
        >
          <img
            src={profileData.profile}
            alt="Cover Photo"
            className="min-w-full min-h-full"
          />
        </div>

        <div className="mx-[25px] pb-3 mt-3 relative">
          <h1 className="text-2xl font-medium text-neutral-700 flex items-center gap-1">
            {profileData.fullName}
            {profileData.verify && (
              <VerifiedBadge isVerified={profileData.verify} />
            )}
          </h1>

          {user ===  myUser ? (
            <button
              onClick={() => set_edit_profile_Ui_Control(true)}
              className="
                         absolute top-[-67px] lg:top-0 right-0 bg-white
                         text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500
                         rounded-full hover:text-sky-500 hover:border-sky-500
                        "
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={async () => {
                setLoader(true);
                const res = await flowReq(profileData._id);
                if (res) {
                  await readProfileReq(user);
                  toast.success("Work successfully !");
                } else {
                  toast.error("Work flow failed!");
                }
                setLoader(false);
              }}
              className={`
                         absolute top-0 right-0
                         ${
                            !loader &&
                            "text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500 rounded-full hover:text-sky-500 hover:border-sky-500"
                          }
                         ${
                           profileData.isFollowing &&
                           "bg-sky-500 text-white border-sky-500 hover:bg-transparent"
                         }
                         `}
            >
              {loader && <LoadingButtonFit />}
              {loader === false &&
                (profileData.isFollowing ? "Unfollow" : "Flow")}
            </button>
          )}

          <h3 className="text-base font-normal text-neutral-700">
            {profileData.username}
          </h3>

          <div className="flex flex-grow justify-start items-center gap-4">
            <div className="flex flex-row justify-start items-center mt-1">
              <h1 className="font-semibold"> {profileData.followers}</h1>
              <p className="text-sm font-medium ms-1 text-neutral-600">
                Followers
              </p>
            </div>
            <div className="flex flex-row justify-start items-center mt-1">
              <h1 className="font-semibold"> {profileData.following}</h1>
              <p className="text-sm font-medium ms-1 text-neutral-600">
                Following
              </p>
            </div>
            <div className="flex flex-row justify-start items-center mt-1">
              <h1 className="font-semibold"> {profileData.postLike}</h1>
              <p className="text-sm font-medium ms-1 text-neutral-600">
                Post Like
              </p>
            </div>
          </div>

          <div className="p-3 my-3 bg-gray-100 rounded ">
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

          <div className="flex flex-wrap justify-start items-center gap-4">
            <div className="flex flex-row justify-start items-center ">
              <IoCallSharp className="text-neutral-800" />
              <p className="text-base font-medium ms-1 text-neutral-800">
                {profileData.phone}
              </p>
            </div>
            <div className="flex flex-row justify-start items-center ">
              <MdEmail className="text-neutral-800" />
              <p className="text-base font-medium ms-1 text-neutral-800">
                {profileData.email}
              </p>
            </div>

            <div className="flex flex-row justify-center lg:justify-end items-center gap-4 flex-grow ">
              {profileData.mediaLink?.facebook !== "" && (
                <FaSquareFacebook
                  className="font-lg text-neutral-800 cursor-pointer"
                  onClick={() => openNewWindow(profileData.mediaLink?.facebook) }
                />
              )}
              {profileData.mediaLink?.linkedin !== "" && (
                <IoLogoLinkedin
                  className="font-lg text-neutral-800 cursor-pointer"
                  onClick={() => openNewWindow(profileData.mediaLink?.linkedin) }
                />
              )}
              {profileData.mediaLink?.github !== "" && (
                <FaGithub
                  className="font-lg text-neutral-800 cursor-pointer"
                  onClick={() => openNewWindow(profileData.mediaLink?.github) }
                />
              )}
              {profileData.mediaLink?.fiver !== "" && (
                <TbBrandFiverr
                  className="font-lg text-neutral-800 cursor-pointer"
                  onClick={() => openNewWindow(profileData.mediaLink.fiver) }
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3 w-full overflow-x-auto scroll-bar-hidden cursor-pointer ">
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
      </div>
    );
  }
};

export default UserInfo;
