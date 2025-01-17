import authorStore from "@/store/authorStore.js";
import {MdEmail, MdOutlineAlternateEmail} from "react-icons/md";
import {IoCallSharp} from "react-icons/io5";
import {FaSquareFacebook} from "react-icons/fa6";
import {IoLogoLinkedin} from "react-icons/io";
import {TbBrandFiverr} from "react-icons/tb";
import {FaGithub} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

const UserInfo = () => {
    const navigate = useNavigate();
    const {profileData} = authorStore()

    if(profileData === null || profileData === undefined) {
        return (
            <h1>Loading......</h1>
        )
    }

    else {
        return (
            <div className=" rounded  border border-gray-200 mb-6">
                <div className="h-[200px] w-full overflow-hidden flex flex-row justify-between items-center shadow ">
                    <img src={profileData.cover} alt="Cover Photo" className="min-w-full min-h-full"/>
                </div>
                <div
                    className="
                    h-[100px] w-[100px] rounded-full overflow-hidden flex flex-row
                     justify-between items-center mx-[25px] mt-[-50px] shadow
                     "
                >
                    <img src={profileData.profile} alt="Cover Photo" className="min-w-full min-h-full"/>
                </div>

                <div className="mx-[25px] pb-3 mt-3 relative">
                    <h1 className="text-2xl font-medium text-neutral-700">
                        {profileData.fullName}
                    </h1>
                    <button
                        className="
                    absolute top-0 right-0
                        text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500
                         rounded-full hover:text-sky-500 hover:border-sky-500
                    "
                    >
                        Edit Profile
                    </button>
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

                    <div className="p-3 my-3 bg-gray-100 rounded">
                        {
                            profileData.bio === "" ?
                                <h1 className="text-sm font-medium text-neutral-700">Please add bio</h1> : (
                                    <h1 className="text-sm font-medium text-neutral-700"></h1>
                                )
                        }
                    </div>

                    <div className="flex flex-wrap justify-start items-center gap-4">
                        <div className="flex flex-row justify-start items-center ">
                            <IoCallSharp className="text-neutral-800"/>
                            <p className="text-base font-medium ms-1 text-neutral-800">
                                {profileData.phone}
                            </p>
                        </div>
                        <div className="flex flex-row justify-start items-center ">
                            <MdEmail className="text-neutral-800"/>
                            <p className="text-base font-medium ms-1 text-neutral-800">
                                {profileData.email}
                            </p>
                        </div>

                        <div className="flex flex-row justify-end items-center gap-4 flex-grow ">
                            {
                                profileData.mediaLink?.facebook !== "" && <FaSquareFacebook className="font-lg text-neutral-800 cursor-pointer" onClick={()=>navigate("/")} />
                            }
                            {
                                profileData.mediaLink?.linkedin !== "" && <IoLogoLinkedin className="font-lg text-neutral-800 cursor-pointer" onClick={()=>navigate("/")} />
                            }
                            {
                                profileData.mediaLink?.github !== "" && <FaGithub className="font-lg text-neutral-800 cursor-pointer" onClick={()=>navigate("/")} />
                            }
                            {
                                profileData.mediaLink?.fiver !== "" && <TbBrandFiverr className="font-lg text-neutral-800 cursor-pointer" onClick={()=>navigate("/")} />
                            }

                        </div>
                    </div>
                </div>


                <div className=" mx-3">
                    <button className="font-medium text-lg py-2 px-3  text-neutral-700 border-b-2 border-neutral-700 ">
                        My Post
                    </button>
                </div>

            </div>
        );
    }


};

export default UserInfo;