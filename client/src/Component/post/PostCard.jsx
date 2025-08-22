import { motion } from "framer-motion";
import { AiFillDelete, AiFillLike } from "react-icons/ai";
import { FaCommentDots, FaLink, FaMapMarkedAlt, FaRegBookmark, FaShare } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import postStore from "../../store/postStore.js";
import { RiEdit2Fill } from "react-icons/ri";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authorStore from "../../store/authorStore.js";
import LoadingButtonFit from "../button/LoadingButtonFit.jsx";
import { BsThreeDotsVertical } from "react-icons/bs";
import VerifiedBadge from "../utility/VerifyBadge.jsx";
import DynamicText from "../utility/DynamicText.jsx";
import useActiveStore from "../../store/useActiveStore.js";

const PostCard = () => {
  let hostname = window.location.origin;
  const { user } = useParams();
  const path = window.location.pathname;
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

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
  const { isUserOnline } = useActiveStore()
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

  const goToProfile = (user) => {
    navigate("/profile/" + user);
    clear_my_post_data();
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
          title: 'Matrix Media',
          text: "Post Share",
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
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-xl shadow-2xl w-[400px] text-center ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
            }`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-neutral-800'
            }`}>
            Are you sure you want to delete this post?
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-neutral-600'
            }`}>
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(false)}
              className={`px-6 py-2 rounded-lg transition duration-200 ease-in-out focus:outline-none ${darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-neutral-800 hover:bg-gray-300'
                }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={DeletePostLoader.status}
              className={`px-6 py-2 rounded-lg transition duration-200 ease-in-out focus:outline-none ${darkMode
                  ? 'bg-red-700 text-white hover:bg-red-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              {DeletePostLoader.status ? (
                <span className="animate-pulse">
                  <div className="loader"></div>
                </span>
              ) : (
                "Delete"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (my_post_data === null) {
    return Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={`max-w-[560px] pt-3 mt-3 rounded-lg shadow-md mx-auto animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
      >
        <div className="flex flex-row ms-3 me-5 gap-3 justify-start items-center">
          <div className={`flex-shrink-0 h-[40px] w-[40px] rounded-full skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
          <div className="flex-grow space-y-2">
            <div className={`h-4 rounded w-1/2 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
            <div className={`h-3 rounded w-1/3 skeleton ${darkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`} />
          </div>
        </div>
        <div className="px-3 mt-4">
          <div className={`h-3 rounded w-3/4 mb-2 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
          <div className={`h-3 rounded w-1/2 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
        </div>
        <div className={`px-3 w-full h-[320px] rounded-md mt-3 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
        <div className="px-4 py-5 flex gap-5">
          <div className={`h-4 rounded w-16 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
          <div className={`h-4 rounded w-20 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
          <div className={`h-4 rounded w-16 skeleton ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
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
              className={`max-w-[560px] pt-3 mt-4 rounded-xl shadow-lg mx-auto cursor-pointer border transition-all duration-300 ${darkMode
                  ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700'
                  : 'bg-white border-gray-200'
                }`}
              onClick={() => (openMenuId != null ? setOpenMenuId(null) : "")}
            >
              <div className="flex flex-row ms-3 me-5 gap-3 justify-start items-center">
                <div className="relative">
                  <div className={`h-12 w-12 rounded-full overflow-hidden cursor-pointer border ${darkMode ? 'border-gray-700' : 'border-gray-300'
                    }`}>
                    <img
                      className="object-cover w-full h-full"
                      onClick={() => goToProfile( items.user.username)}
                      src={items.user.profile}
                      alt="profile image"
                    />
                    {/* Online/Offline Status Indicator */}
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${isUserOnline(items.user._id)
                          ? (darkMode ? 'bg-green-500 border-gray-900' : 'bg-green-500 border-white')
                          : (darkMode ? 'bg-red-500 border-gray-900' : 'bg-red-500 border-white')
                        }`}
                    ></div>
                  </div>
                </div>

                <div className="mb-2 flex-grow">
                  <h2 className={`text-base font-medium flex gap-1 items-center w-fit ${darkMode ? 'text-gray-100' : 'text-neutral-800'
                    }`}>
                    <span
                      onClick={() =>
                        goToProfile( items.user.username)
                      }
                      className={`cursor-pointer hover:underline ${darkMode ? 'text-cyan-300' : 'text-sky-500'
                        }`}
                    >
                      {items.user?.fullName}
                    </span>
                    {items.user.verify && (
                      <VerifiedBadge isVerified={items.user.verify} darkMode={darkMode} />
                    )}
                  </h2>
                  <p className={`text-base w-fit ${darkMode ? 'text-gray-400' : 'text-neutral-600'
                    }`}>
                    {items.time}
                  </p>
                </div>

                {items.myPost !== true && (
                  <>
                    {followLoader.status && followLoader.id === i ? (
                      <LoadingButtonFit darkMode={darkMode} />
                    ) : (
                      <>
                        {items.isFollowing === true ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => followHandel(items.user._id, i)}
                            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 ${darkMode
                                ? 'text-cyan-300 hover:bg-cyan-900/30'
                                : 'text-sky-500 hover:bg-sky-50'
                              }`}
                          >
                            Unfollow
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => followHandel(items.user._id, i)}
                            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 ${darkMode
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-neutral-800 hover:bg-gray-100'
                              }`}
                          >
                            Follow
                          </motion.button>
                        )}
                      </>
                    )}
                  </>
                )}

                <div className="relative inline-block">
                  {openMenuId === items._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`absolute right-0 z-100 mt-2 w-56 rounded-lg shadow-xl ring-1 focus:outline-none transition-all duration-200 ${darkMode
                          ? 'bg-gray-800 ring-gray-700'
                          : 'bg-white ring-black ring-opacity-5'
                        }`}
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                    >
                      <div className="py-2">
                        {items.myPost && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setUpdatePostData("id", items._id);
                                setUpdatePostData("caption", items.caption);
                                setOpenMenuId(null);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition duration-200 ease-in-out ${darkMode
                                  ? 'text-gray-200 hover:bg-cyan-900/30 hover:text-cyan-300'
                                  : 'text-neutral-800 hover:bg-sky-50 hover:text-sky-500'
                                }`}
                            >
                              <RiEdit2Fill className="mr-2 text-lg" /> Edit Post
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                openDeleteModal(items);
                                setOpenMenuId(null);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition duration-200 ease-in-out ${darkMode
                                  ? 'text-gray-200 hover:bg-red-900/30 hover:text-red-300'
                                  : 'text-neutral-800 hover:bg-red-50 hover:text-red-500'
                                }`}
                            >
                              <AiFillDelete className="mr-2 text-lg" /> Delete Post
                            </motion.button>
                            <div className={`my-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'
                              }`} />
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname + "/post/" + items._id);
                            setOpenMenuId(null);
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition duration-200 ease-in-out ${darkMode
                              ? 'text-gray-200 hover:bg-cyan-900/30 hover:text-cyan-300'
                              : 'text-neutral-800 hover:bg-sky-50 hover:text-sky-500'
                            }`}
                        >
                          <FaLink className="mr-2 text-lg" /> Copy Link
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setOpenMenuId(null);
                            handleShare(items._id)
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition duration-200 ease-in-out ${darkMode
                              ? 'text-gray-200 hover:bg-cyan-900/30 hover:text-cyan-300'
                              : 'text-neutral-800 hover:bg-sky-50 hover:text-sky-500'
                            }`}
                        >
                          <FaShare className="mr-2 text-lg" /> Share
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setOpenMenuId(null);
                            postSaveHandler(items._id, items.isSave, items.postSave)
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition duration-200 ease-in-out ${darkMode
                              ? 'text-gray-200 hover:bg-cyan-900/30 hover:text-cyan-300'
                              : 'text-neutral-800 hover:bg-sky-50 hover:text-sky-500'
                            }`}
                        >
                          {items.isSave ? <IoBookmark className="mr-2 text-lg" /> : <FaRegBookmark className="mr-2 text-lg" />} Save
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleMenu(items._id)}
                  className={`p-1 rounded-full transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-neutral-800 hover:text-sky-500'
                    }`}
                >
                  <BsThreeDotsVertical className="text-lg font-semibold" />
                </motion.button>
              </div>

              <h4 className={`px-3 mb-2 text-base font-medium ${darkMode ? 'text-gray-200' : 'text-neutral-700'
                }`}>
                {items.images !== null && items.caption !== "" && (
                  <DynamicText
                    text={items.caption}
                    Length={110}
                    TestStyle={`text-lg font-normal ${darkMode ? 'text-gray-300' : 'text-neutral-700'
                      } leading-[120%]`}
                  />
                )}
              </h4>

              <div className={`px-3 overflow-hidden w-full h-[320px] flex flex-row justify-center items-center ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
                }`}>
                {items.images !== null ? (
                  items.images.map((image, i) => (
                    <motion.img
                      key={i}
                      src={image}
                      alt="post photo"
                      className="min-w-full min-h-full object-cover"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    />
                  ))
                ) : (
                  <div className={`h-full w-full flex flex-row justify-center items-center ${darkMode ? 'bg-gray-900/30' : 'bg-gray-100'
                    }`}>
                    <div className="max-w-full max-h-full overflow-y-auto scroll-bar-hidden p-5">
                      <DynamicText
                        text={items.caption}
                        Length={270}
                        Align={"flex flex-col "}
                        TestStyle={`text-xl lg:text-2xl font-medium lg:font-semibold ${darkMode ? 'text-gray-200' : 'text-neutral-700'
                          }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-5 flex flex-row justify-between items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => likePostHandler(items._id, items.isLike, items.likes)}
                  className="flex flex-row gap-2 justify-start items-center"
                >
                  {loader.status && loader.id === items._id ? (
                    <div className="loader-dark"></div>
                  ) : (
                    <motion.div
                      animate={items.isLike ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <AiFillLike
                        className={`text-lg ${items.isLike
                            ? (darkMode ? 'text-cyan-400' : 'text-sky-600')
                            : (darkMode ? 'text-gray-400' : 'text-neutral-800')
                          }`}
                      />
                    </motion.div>
                  )}
                  <h1 className={`text-base font-medium flex items-center gap-1 ${items.isLike
                      ? (darkMode ? 'text-cyan-400' : 'text-sky-600')
                      : (darkMode ? 'text-gray-400' : 'text-neutral-800')
                    }`}>
                    {items.likes}
                    <span className="hidden md:block">
                      {items.isLike ? "Liked" : "Like"}
                    </span>
                  </h1>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCommentPostData("id", items._id);
                    removeCommentList(null);
                  }}
                  className="flex flex-row gap-2 justify-start items-center"
                >
                  <FaCommentDots className={`text-lg ${darkMode ? 'text-gray-400' : 'text-neutral-900'
                    }`} />
                  <h1 className={`text-base font-medium flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-neutral-900'
                    }`}>
                    {items.comment}
                    <span className="hidden md:block">comments</span>
                  </h1>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(items._id)}
                  className="flex flex-row gap-2 justify-start items-center"
                >
                  <FaShare className={`text-lg ${darkMode ? 'text-gray-400' : 'text-neutral-900'
                    }`} />
                  <h1 className={`text-base font-medium hidden md:block ${darkMode ? 'text-gray-400' : 'text-neutral-900'
                    }`}>
                    Share
                  </h1>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-row flex-grow gap-2 justify-end items-center"
                >
                  {savePostLoader.status && savePostLoader.id === items._id ? (
                    <div className="loader-dark"></div>
                  ) : (
                    <motion.div
                      animate={items.isSave ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {items.isSave ? (
                        <IoBookmark
                          onClick={() => postSaveHandler(items._id, items.isSave, items.postSave)}
                          className={`text-lg ${darkMode ? 'text-cyan-400' : 'text-neutral-800'
                            }`}
                        />
                      ) : (
                        <FaRegBookmark
                          onClick={() => postSaveHandler(items._id, items.isSave, items.postSave)}
                          className={`text-lg ${darkMode ? 'text-gray-400' : 'text-neutral-800'
                            }`}
                        />
                      )}
                    </motion.div>
                  )}
                  <h1
                    onClick={() => postSaveHandler(items._id, items.isSave, items.postSave)}
                    className={`text-base font-medium ${items.isSave
                        ? (darkMode ? 'text-cyan-400' : 'text-neutral-800')
                        : (darkMode ? 'text-gray-400' : 'text-neutral-800')
                      }`}
                  >
                    {items.postSave} Save
                  </h1>
                </motion.div>
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