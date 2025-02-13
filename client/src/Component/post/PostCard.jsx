import { motion } from "framer-motion";
import { AiFillDelete, AiFillLike } from "react-icons/ai";
import { FaCommentDots, FaLink, FaMapMarkedAlt, FaRegBookmark, FaShare } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import postStore from "@/store/postStore.js";
import { RiEdit2Fill } from "react-icons/ri";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authorStore from "@/store/authorStore.js";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import { BsThreeDotsVertical } from "react-icons/bs";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import DynamicText from "@/Component/utility/DynamicText.jsx";



const PostCard = () => {
  let hostname = window.location.origin;
  const { user } = useParams();
  const path = window.location.pathname;
  const navigate = useNavigate();
  const {
    my_post_data,
    setUpdatePostData,
    deletePostReq,
    myPostReq,
    likePostReq,
    setCommentPostData,
    removeCommentList,
    newsFeedReq,
    savePostReq,
    update_my_post_data,
    clear_my_post_data,
  } = postStore();

  const { myProfileData, flowReq } = authorStore();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const [loader, setLoader] = useState({
    status: false,
    id: null,
  });

  const [DeletePostLoader, setDeletePostLoader] = useState({
    status: false,
    id: null,
  });

  const [followLoader, setFollowLoader] = useState({
    status: false,
    id: null,
  });

  const [savePostLoader, setSavePostLoader] = useState({
    status: false,
    id: null,
  });


  const goToProfile = (isPost, user) => {
    if (isPost) {
      navigate("/profile/me");
      clear_my_post_data();
    } else {
      navigate("/profile/" + user);
      clear_my_post_data();
    }
  };

  const followHandel = async (id, i) => {
    setFollowLoader({
      status: true,
      id: i,
    });
    let res = await flowReq(id);
    setFollowLoader({
      status: false,
      id: null,
    });
    if (res) {
      toast.success("Following Successful");
      await newsFeedReq();
    } else {
      toast.error("Following Fail");
    }
  };

  const postSaveHandler = async (id, isSave, postSave) => {
    setSavePostLoader({
      status: true,
      id: id,
    });
    const res = await savePostReq(id);
    if (res) {
      isSave ? update_my_post_data(id, { isSave: false, postSave: postSave - 1 }) : update_my_post_data(id, { isSave: true, postSave: postSave + 1 })

    }

    setSavePostLoader({
      status: false,
      id: null,
    });
  };

  const likePostHandler = async (id, isLike, Like) => {
    console.log(isLike, id, Like);
    setLoader({
      status: true,
      id: id,
    });
    const res = await likePostReq(id);

    setLoader({
      status: false,
      id: null,
    });

    let like = Like - 1;
    let add = Like + 1;

    if (res) {
      if (isLike === true) {
        update_my_post_data(id, { isLike: false, likes: like });
      }
      if (isLike === false) {
        update_my_post_data(id, { isLike: true, likes: add });
      }
    }

  };

  const handleDelete = async () => {
    if (postToDelete) {
      setDeletePostLoader({ status: true, id: postToDelete._id });
      const res = await deletePostReq(postToDelete._id);
      setDeletePostLoader({ status: false, id: null });
      setIsModalOpen(false);

      if (res) {
        toast.success("Post deleted successfully");
        if (path === "/") {
          await newsFeedReq();
        } else {
          const username = user !== "me" ? user : myProfileData.username;
          await myPostReq(username);
        }
      }
      setPostToDelete(null);
    }
    setIsModalOpen(false);
  };

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setIsModalOpen(true);
  };

  const toggleMenu = (id) => {
    setOpenMenuId((prevId) => (prevId === id ? null : id));
  };




  const handleShare = async (id) => {
    const url = hostname + "/post/" + id
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KAM_DEE',
          text: 'Mr.CEO_and_Founder_Of_UVIOM .',
          url: url,
        });

      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing is not supported in this browser.');
    }
  };

  const DeleteConfirmationModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-xl w-[400px] text-center">
          <h3 className="text-xl font-semibold text-neutral-800 mb-4">
            Are you sure you want to delete this post?
          </h3>
          <p className="text-neutral-600 mb-6">This action cannot be undone.</p>
          <div className="flex justify-center gap-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-gray-200 text-neutral-800 rounded-lg transition duration-200 ease-in-out hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={DeletePostLoader.status}
              className="px-6 py-2 bg-red-600 text-white rounded-lg transition duration-200 ease-in-out hover:bg-red-700 focus:outline-none"
            >
              {DeletePostLoader.status ? (
                <span className="animate-pulse">
                  <div className="loader"></div>
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (my_post_data === null) {
    return Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="max-w-[560px] pt-3 mt-3 rounded shadow-md mx-auto animate-pulse"
      >
        <div className="flex flex-row ms-3 me-5 gap-3 justify-start items-center">
          <div className="flex-shrink-0 h-[40px] w-[40px] bg-gray-300 rounded-full skeleton" />
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/2 skeleton" />
            <div className="h-3 bg-gray-200 rounded w-1/3 skeleton" />
          </div>
        </div>

        <div className="px-3 mt-4">
          <div className="h-3 bg-gray-300 rounded w-3/4 mb-2 skeleton" />
          <div className="h-3 bg-gray-300 rounded w-1/2 skeleton" />
        </div>

        <div className="px-3 w-full h-[320px] bg-gray-200 rounded-md mt-3 skeleton" />

        <div className="px-4 py-5 flex gap-5">
          <div className="h-4 bg-gray-300 rounded w-16 skeleton" />
          <div className="h-4 bg-gray-300 rounded w-20 skeleton" />
          <div className="h-4 bg-gray-300 rounded w-16 skeleton" />
        </div>
      </div>
    ));
  }

  else {
    return (
      <>
        <DeleteConfirmationModal />

        {my_post_data.map((items, i) => {
          return (
            <motion.div
              key={i}
              whileHover={{ opacity: 1, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
              }}
              post-id={items._id}
              className="max-w-[560px] pt-3 mt-4 rounded shadow-lg mx-auto cursor-pointer border"
              onClick={() => (openMenuId != null ? setOpenMenuId(null) : "")}
            >
              <div className="flex flex-row ms-3 me-5 gap-3 justify-start items-center">
                <div
                  className=" flex-shrink-0  h-[40px] w-[40px] rounded-full
                    overflow-hidden flex flex-row justify-center items-center shadow"
                >
                  <img
                    className="min-h-full min-w-full"
                    onClick={() =>
                      goToProfile(items.myPost, items.user.username)
                    }
                    src={items.user.profile}
                    alt="profile image"
                  />
                </div>
                <div className="mb-2 flex-grow">
                  <h2 className="text-base font-medium text-neutral-800 flex gap-1 items-center w-fit">
                    <span
                      onClick={() =>
                        goToProfile(items.myPost, items.user.username)
                      }
                      className="cursor-pointer hover:underline"
                    >
                      {items.user?.fullName}
                    </span>
                    {items.user.verify && (
                      <VerifiedBadge isVerified={items.user.verify} />
                    )}
                  </h2>
                  <p className="text-base text-neutral-600 w-fit">
                    {items.time}
                  </p>
                </div>


                {items.myPost !== true && (
                  <>
                    {followLoader.status &&
                      followLoader.id === i ? (
                      <LoadingButtonFit />
                    ) : (
                      <>
                        {items.isFollowing === true ? (
                          <button
                            onClick={() => followHandel(items.user._id, i)}
                            className="text-sm font-medium text-sky-500
                                      "
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => followHandel(items.user._id, i)}
                            className="text-sm font-medium text-neutral-800 hover:text-sky-500"
                          >
                            Follow
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
                <div className="relative inline-block">

                  {openMenuId === items._id && (
                    <div
                      className="absolute right-0 z-100 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out transform scale-95 hover:scale-100"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                    >
                      <div className="py-2">
                        {items.myPost &&
                          <>
                            <button
                              onClick={() => {
                                setUpdatePostData("id", items._id);
                                setUpdatePostData("caption", items.caption);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-neutral-800 hover:bg-sky-50 hover:text-sky-500 rounded-md transition duration-200 ease-in-out"
                            >
                              <RiEdit2Fill className="mr-2 text-lg" /> Edit Post
                            </button>

                            <button
                              onClick={() => {
                                openDeleteModal(items);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-neutral-800 hover:bg-red-50 hover:text-red-500 rounded-md transition duration-200 ease-in-out"
                            >
                              <AiFillDelete className="mr-2 text-lg" /> Delete Post
                            </button>

                            <hr className="my-2" />
                          </>}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname + "/post/" + items._id);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-800 hover:bg-sky-50 hover:text-sky-500 rounded-md transition duration-200 ease-in-out"
                        >
                          <FaLink className="mr-2 text-lg" /> Copy Link
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleShare(items._id)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-800 hover:bg-sky-50 hover:text-sky-500 rounded-md transition duration-200 ease-in-out"
                        >
                          <FaShare className="mr-2 text-lg" /> Share
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            postSaveHandler(items._id, items.isSave, items.postSave)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-neutral-800 hover:bg-sky-50 hover:text-sky-500 rounded-md transition duration-200 ease-in-out"
                        >
                          {items.isSave ? <IoBookmark className="mr-2 text-lg" /> : <FaRegBookmark className="mr-2 text-lg" />} Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleMenu(items._id)}
                  className="text-neutral-800 hover:text-sky-500"
                >
                  <BsThreeDotsVertical className="text-lg font-semibold" />
                </button>
              </div>


              <h4 className=" px-3 mb-2  text-base font-medium text-neutral-700">
                {items.images !== null && items.caption !== "" && (
                  <DynamicText
                    text={items.caption}
                    Length={110}
                    TestStyle={"text-lg font-normal text-neutral-700 leading-[120%]"}
                  />
                )}
              </h4>

              <div className="px-3  overflow-hidden w-full h-[320px] flex flex-row justify-center items-center">
                {items.images !== null ? (
                  items.images.map((image, i) => {
                    return (
                      <img
                        key={i}
                        src={image}
                        alt="post photo"
                        className="min-w-full min-h-full"
                      />
                    );
                  })
                ) : (
                  <div className="h-full w-full flex flex-row justify-center items-center bg-gray-100">
                    <div className="max-w-full max-h-full overflow-y-auto scroll-bar-hidden p-5">
                      <DynamicText
                        text={items.caption}
                        Length={270}
                        Align={"flex flex-col "}
                        TestStyle={"text-xl lg:text-2xl font-medium lg:font-semibold"}

                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 py-5 flex flex-row justify-s items-center gap-5">
                <div
                  onClick={() =>
                    likePostHandler(items._id, items.isLike, items.likes)
                  }
                  className="flex flex-row gap-2 justify-start items-center"
                >
                  {loader.status && loader.id === items._id && (
                    <div className="loader-dark "></div>
                  )}

                  {loader.id !== items._id && (
                    <AiFillLike
                      className={`${items.isLike ? "text-sky-600" : "text-neutral-800"
                        } text-lg`}
                    />
                  )}

                  <h1
                    className={`text-base font-medium flex items-center gap-1  ${items.isLike ? "text-sky-600" : "text-neutral-800"}`}
                  >
                    {items.likes}
                    <span className="hidden md:block">{items.isLike ? "Liked" : "Like"}</span>
                  </h1>
                </div>

                <div
                  onClick={() => {
                    setCommentPostData("id", items._id);
                    removeCommentList(null);
                  }}
                  className="flex flex-row gap-2 justify-start items-center
                        "
                >
                  <FaCommentDots className="text-neutral-900 text-lg" />
                  

                  <h1
                    className={`text-base font-medium flex items-center gap-1  ${items.comment ? "text-sky-600" : "text-neutral-800"}`}
                  >
                    {items.comment}
                    <span className="hidden md:block">comments</span>
                  </h1>
                </div>

                <div
                  onClick={
                    () => handleShare(items._id)
                  }
                  className="flex flex-row gap-2 justify-start items-center"
                >
                  <FaShare className="text-neutral-900 text-lg" />
                  <h1 className="text-base font-medium text-neutral-900 hidden md:block">
                    {/*{items.view} Share*/} Share
                  </h1>
                </div>

                <div
                  className="flex flex-row flex-grow gap-2 justify-end items-center"
                >
                  {savePostLoader.status && savePostLoader.id === items._id ? (
                    <div className="loader-dark"></div>
                  ) : (
                    <>
                      {items.isSave ? (
                        <IoBookmark
                          onClick={() => postSaveHandler(items._id, items.isSave, items.postSave)}
                          className="text-neutral-800 text-lg" />
                      ) : (
                        <FaRegBookmark
                          onClick={() => postSaveHandler(items._id, items.isSave, items.postSave)}
                        />
                      )}
                    </>
                  )}

                  <h1
                    onClick={() => postSaveHandler(items._id, items.isSave, items.postSave)}
                    className="text-base font-medium text-neutral-800
                    "
                  >
                    {items.postSave} Save
                  </h1>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div className="py-[50px] md:py-0"></div>
      </>
    );
  }
};

export default PostCard;
