import { useState } from "react";
import {FaFacebook, FaLinkedin, FaGithub, FaFacebookF, FaGit, FaLinkedinIn} from "react-icons/fa";
import authorStore from "@/store/authorStore.js";
import toast from "react-hot-toast";
import {TbBrandFiverr} from "react-icons/tb";
import {useParams} from "react-router-dom";

const SocialMediaComponent = () => {
  const {user} = useParams();
  let userName = localStorage.getItem('userName');

  const {myProfileData ,updateProfileReq ,  updateMediaLinkValue} = authorStore()


  const [editing, setEditing] = useState(null);


  const [loading, setLoading] = useState(false);

  const [editData ,setEditData ] = useState();

  const toggleEdit = (platform ,url) => {
    setEditData(url)
    setEditing(platform);
  };

  const visit = (url)=>{
    window.open(url);
  }

  const handleProfileUpdate = async (icon) => {
    updateMediaLinkValue(icon,editData);

    setLoading(true);

    let reqData = ""

    if(icon === "facebook"){
      reqData = {
        facebook: editData,
      };
    }



    if(icon === "linkedin"){
      reqData = {
        linkedin: editData,

      };
    }

    if(icon === "fiver"){
      reqData = {
        fiver: editData,

      };
    }

    if(icon === "github"){
      reqData = {
        github: editData,

      };
    }


    const res = await updateProfileReq(reqData);
    setLoading(false);
    setEditData("")
    if (res) {
      toggleEdit(false)
      toast.success("Profile Updated Successfully");
    } else {
      toast.error("Profile Update Failed");
    }
  };


  if(myProfileData == null){
    return (
        <div className="px-8">
          <h2 className="text-xl mt-8 font-semibold mb-4 text-center">Manage Social Media Links</h2>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300">
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              <div className="flex-grow h-4 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300">
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              <div className="flex-grow h-4 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300">
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              <div className="flex-grow h-4 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
    )

  }

  else {
    return (
        <div className="px-4 lg:px-8 border-b pb-8">
          <h2 className="text-xl mt-4 lg:mt-8 font-semibold mb-4 text-center">Manage Social Media Links</h2>
          <div className="space-y-4 pt-2 ">

            <div
                className="flex flex-wrap justify-center items-center gap-4 bg-gray-50  p-4 rounded-md shadow-sm border border-gray-300"
            >
              <FaFacebookF className="text-2xl flex-shrink-0 text-sky-500"/>

              {editing === "facebook" ? (
                  <input
                      type="text"
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      className="flex-grow bg-transparent outline-none text-sm placeholder-gray-400 border-b-2 border-gray-300 focus:border-blue-500"
                  />
              ) : (
                  <span className="flex-grow text-sm text-gray-700">
                     {myProfileData.mediaLink?.facebook || "Add Facebook Link"}
                     </span>
              )}

              {editing === "facebook" ? (
                  <button
                      onClick={() => handleProfileUpdate("facebook")}
                      className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                  >
                    {
                      loading ? <div className="loader"></div> : "Save"
                    }

                  </button>
              ) : (
                  <div className="flex gap-3">
                    <a
                        onClick={
                          () => visit(myProfileData.mediaLink?.facebook)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 text-sm rounded-md ${
                            myProfileData.mediaLink?.facebook !== null
                                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      Visit
                    </a>
                    {
                      user === userName && (
                            <button
                                onClick={() => toggleEdit("facebook", myProfileData.mediaLink?.facebook)}
                                className="px-3 py-1 text-sm rounded-md bg-gray-300 text-neutral-700 hover:bg-gray-700 hover:text-white"
                            >
                              Edit
                            </button>
                        )
                    }
                  </div>
              )}
            </div>

            <div
                className="flex flex-wrap justify-center items-center gap-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300"
            >
              <FaLinkedinIn className="text-2xl flex-shrink-0 text-sky-500"/>

              {editing === "linkdin" ? (
                  <input
                      type="text"
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      className="flex-grow bg-transparent outline-none text-sm placeholder-gray-400 border-b-2 border-gray-300 focus:border-blue-500"
                  />
              ) : (
                  <span className="flex-grow text-sm text-gray-700">
                     {myProfileData.mediaLink?.linkedin || "Add Facebook Link"}
                     </span>
              )}

              {editing === "linkdin" ? (
                  <button
                      onClick={() => handleProfileUpdate("linkedin")}
                      className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                  >
                    {
                      loading ? <div className="loader"></div> : "Save"
                    }

                  </button>
              ) : (
                  <div className="flex gap-3">
                    <a
                        onClick={
                          () => visit(myProfileData.mediaLink?.linkedin)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 text-sm rounded-md ${
                            myProfileData.linkedin?.linkedin !== null
                                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      Visit
                    </a>

                    {
                      user === userName && (
                            <button
                                onClick={() => toggleEdit("linkdin", myProfileData.mediaLink?.linkedin)}
                                className="px-3 py-1 text-sm rounded-md bg-gray-300 text-neutral-700 hover:bg-gray-700 hover:text-white"
                            >
                              Edit
                            </button>
                        )
                    }

                  </div>
              )}
            </div>

            <div
                className="flex flex-wrap justify-center items-center gap-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300"
            >
              <TbBrandFiverr className="text-2xl flex-shrink-0 text-sky-500"/>

              {editing === "fiver" ? (
                  <input
                      type="text"
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      className="flex-grow bg-transparent outline-none text-sm placeholder-gray-400 border-b-2 border-gray-300 focus:border-blue-500"
                  />
              ) : (
                  <span className="flex-grow text-sm text-gray-700">
                     {myProfileData.mediaLink?.fiver || "Add Facebook Link"}
                     </span>
              )}

              {editing === "fiver" ? (
                  <button
                      onClick={() => handleProfileUpdate("fiver")}
                      className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                  >
                    {
                      loading ? <div className="loader"></div> : "Save"
                    }

                  </button>
              ) : (
                  <div className="flex gap-3">
                    <a
                        onClick={
                          () => visit(myProfileData.mediaLink?.fiver)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 text-sm rounded-md ${
                            myProfileData.mediaLink?.fiver !== null
                                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      Visit
                    </a>
                    {
                      user === userName && (
                            <button
                                onClick={() => toggleEdit("fiver", myProfileData.mediaLink?.fiver)}
                                className="px-3 py-1 text-sm rounded-md bg-gray-300 text-neutral-700 hover:bg-gray-700 hover:text-white"
                            >
                              Edit
                            </button>
                        )
                    }
                  </div>
              )}
            </div>

            <div
                className="flex flex-wrap justify-center items-center gap-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300"
            >
              <FaGit className="text-2xl text-sky-500"/>

              {editing === "github" ? (
                  <input
                      type="text"
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      className="flex-grow bg-transparent outline-none text-sm placeholder-gray-400 border-b-2 border-gray-300 focus:border-blue-500"
                  />
              ) : (
                  <span className="flex-grow text-sm text-gray-700">
                     {myProfileData.mediaLink?.github || "Add Facebook Link"}
                     </span>
              )}

              {editing === "github" ? (
                  <button
                      onClick={() => handleProfileUpdate("github")}
                      className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                  >
                    {
                      loading ? <div className="loader"></div> : "Save"
                    }

                  </button>
              ) : (
                  <div className="flex gap-3">
                    <a
                        onClick={
                          () => visit(myProfileData.mediaLink?.github)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 text-sm rounded-md ${
                            myProfileData.mediaLink?.github !== null
                                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      Visit
                    </a>
                    {
                      user === userName && (
                            <button
                                onClick={() => toggleEdit("github", myProfileData.mediaLink?.github)}
                                className="px-3 py-1 text-sm rounded-md bg-gray-300 text-neutral-700 hover:bg-gray-700 hover:text-white"
                            >
                              Edit
                            </button>
                        )
                    }
                  </div>
              )}
            </div>


          </div>
        </div>
    );
  }


};

export default SocialMediaComponent;