import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaImages } from "react-icons/fa";
import { MdEmojiEmotions } from "react-icons/md";
import { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import postStore from "../store/postStore.js";
import LoadingButtonFit from "../Component/button/LoadingButtonFit.jsx";
import { RiEdit2Fill } from "react-icons/ri";
import { AiFillDelete } from "react-icons/ai";
import { useParams } from "react-router-dom";
import authorStore from "../store/authorStore.js";
import VerifiedBadge from "../Component/utility/VerifyBadge.jsx";
import useActiveStore from "../store/useActiveStore.js";

const CommentPopup = () => {
  const { user } = useParams();
  const path = window.location.pathname;
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isUserOnline } = useActiveStore();
  const {
    setCommentPostData,
    commentPostData,
    clearCommentPostData,
    commentPostReq,
    myPostReq,
    commentListReq,
    commentList,
    newsFeedReq,
    deletePostCommentReq,
    updateComment,
  } = postStore();
  const { myProfileData } = authorStore();
  const id = commentPostData.id;
  const [loader, setLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState({
    status: false,
    id: null,
  });

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await commentListReq(id);
    })();
  }, [id]);

  const handleEmojiClick = (emojiData) => {
    if (commentPostData.comment === undefined) {
      commentPostData.comment = "";
    }
    let newCommentPostData = commentPostData.comment + emojiData.emoji;
    setCommentPostData("comment", newCommentPostData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitComment = async () => {
    setLoader(true);
    if (commentPostData.commentId === undefined) {
      let res = await commentPostReq(commentPostData);
      if (res) {
        if (path === "/") {
          await newsFeedReq();
        } else {
          if (user !== "me") {
            await myPostReq(user);
          } else {
            await myPostReq(myProfileData.username);
          }
        }
        clearCommentPostData(null);
        toast.success("Comment Create Successfully");
      } else {
        toast.error("Comment Create Failed");
      }
    } else {
      let res = await updateComment(commentPostData);
      if (res) {
        if (path === "/") {
          await newsFeedReq();
        } else {
          if (user !== "me") {
            await myPostReq(user);
          } else {
            await myPostReq(myProfileData.username);
          }
        }
        clearCommentPostData(null);
        toast.success("Comment Update Successfully");
      } else {
        toast.error("Comment Update Failed");
      }
    }
    setLoader(false);
  };

  const deleteComment = async (id) => {
    setDeleteLoader({
      status: true,
      id: id,
    });
    const postId = commentPostData.id;
    let res = await deletePostCommentReq(postId, id);
    setDeleteLoader({
      status: false,
      id: null,
    });
    if (res) {
      toast.success("Comment Delete Successfully");
      await commentListReq(postId);
    } else {
      toast.error("Comment Delete Failed");
    }
  };

  const editComment = (id, data) => {
    setCommentPostData("comment", data);
    setCommentPostData("commentId", id);
  };

  // Skeleton loading component
  const CommentSkeleton = () => (
    <div className="pt-3 pb-1 ps-2 pe-1 border-b mx-4 animate-pulse">
      <div className="flex flex-row gap-3 justify-start items-start">
        <div className={`flex-shrink-0 h-[35px] w-[35px] rounded-full ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
        <div className="flex-grow">
          <div className={`h-4 rounded w-1/2 mb-2 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className={`h-4 rounded w-1/3 ${
            darkMode ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-end">
        <div className={`h-4 rounded w-full ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
        <div className="flex justify-end items-center gap-3 my-1 w-full mt-2">
          <div className={`h-6 w-6 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className={`h-6 w-6 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`h-screen w-screen fixed top-0 right-0 z-[9999999] mx-auto flex justify-center items-center overflow-hidden ${
        darkMode ? 'bg-black/70' : 'bg-white/60'
      } backdrop-blur-sm`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-[600px] h-[80%] w-full shadow-lg rounded mx-3 md:px-0 relative overflow-hidden scroll-bar-hidden ${
          darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border`}
      >
        {/* Header */}
        <div
          className={`flex flex-row justify-between items-center pb-3 sticky w-full left-0 z-30 top-0 backdrop-blur-sm p-5 border-b ${
            darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'
          }`}
        >
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-gray-100' : 'text-neutral-700'
          }`}>
            Add Comment
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => clearCommentPostData(null)}
            className={`text-2xl font-semibold cursor-pointer ${
              darkMode ? 'text-gray-300 hover:text-cyan-300' : 'text-neutral-800 hover:text-sky-500'
            }`}
          >
            <IoClose />
          </motion.button>
        </div>

        {/* Comments List */}
        <div className="scroll-bar-hidden overflow-y-auto h-full pb-64">
          {commentList === null ? (
            [1, 1, 1, 1].map((_, index) => <CommentSkeleton key={index} />)
          ) : (
            commentList.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`py-4 px-4 border-b hover:transition-colors ${
                  darkMode ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Profile Image and Status */}
                  <div className="relative flex-shrink-0">
                    <Link to={`/profile/${item.user.username}`}>
                      <div className={`h-10 w-10 rounded-full overflow-hidden border-2 ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <img
                          src={item.user.profile}
                          alt={`${item.user.fullName} profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
                        isUserOnline(item.user._id)
                          ? (darkMode ? 'bg-green-500 border-gray-900' : 'bg-green-500 border-white')
                          : (darkMode ? 'bg-red-500 border-gray-900' : 'bg-red-500 border-white')
                      }`}
                    ></div>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${item.user.username}`}
                        className={`text-sm font-semibold hover:underline ${
                          darkMode ? 'text-gray-200 hover:text-cyan-300' : 'text-neutral-800 hover:text-sky-500'
                        }`}
                      >
                        {item.user.fullName}
                      </Link>
                      {item.user.verify && <VerifiedBadge isVerified={item.user.verify} darkMode={darkMode} />}
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        @{item.user.username}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 break-words ${
                      darkMode ? 'text-gray-300' : 'text-neutral-700'
                    }`}>
                      {item.comment}
                    </p>

                    {/* Actions (Edit/Delete) */}
                    {item.isComment && (
                      <div className="flex items-center gap-4 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => editComment(item._id, item.comment)}
                          className={`transition-colors ${
                            darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-neutral-600 hover:text-sky-500'
                          }`}
                          title="Edit comment"
                        >
                          <RiEdit2Fill className="text-base" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteComment(item._id)}
                          className={`transition-colors ${
                            darkMode ? 'text-gray-400 hover:text-red-400' : 'text-neutral-600 hover:text-red-500'
                          }`}
                          title="Delete comment"
                        >
                          {deleteLoader.status && deleteLoader.id === item._id ? (
                            <div className="loader-dark w-4 h-4"></div>
                          ) : (
                            <AiFillDelete className="text-base" />
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Emoji Picker */}
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseLeave={() => setShowPicker(false)}
            className="absolute top-0 right-0 z-30"
          >
            <EmojiPicker 
              className="ms-auto" 
              onEmojiClick={handleEmojiClick}
              theme={darkMode ? "dark" : "light"}
            />
          </motion.div>
        )}

        {/* Comment Input */}
        <div
          className={`px-5 py-3 absolute bottom-0 left-0 w-full backdrop-blur-sm shadow ${
            darkMode ? 'bg-gray-800/80 border-t border-gray-700' : 'bg-white/80 border-t border-gray-100'
          }`}
        >
          <div className={`flex flex-row gap-3 justify-center items-start pb-2 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            <div className="flex-shrink-0 h-[35px] w-[35px] rounded-full overflow-hidden flex flex-row justify-center items-center">
              <img
                src={myProfileData.profile}
                alt="profile image"
                className="min-w-full min-h-full object-cover"
              />
            </div>
            <textarea
              rows={2}
              value={commentPostData.comment || ""}
              onChange={(e) => setCommentPostData("comment", e.target.value)}
              className={`text-base flex-grow w-full bg-transparent resize-none outline-none ${
                darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-neutral-800 placeholder-gray-400'
              }`}
              placeholder="Type Comment"
            />
          </div>

          {image && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="w-full h-[250px] flex justify-center items-center overflow-hidden relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setImage(null)}
                className={`h-[35px] w-[35px] rounded-full cursor-pointer absolute top-3 right-3 flex justify-center items-center shadow ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}
              >
                <IoClose className={`mx-auto text-2xl font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-neutral-800'
                }`} />
              </motion.button>
              <img
                src={image}
                alt="Uploaded Device"
                className="min-w-full min-h-full object-cover"
              />
            </motion.div>
          )}

          <div className="flex flex-row justify-between gap-3 items-center pt-3">
            <div className="flex flex-row justify-start gap-3 items-center">
              <div className="flex flex-row items-center overflow-hidden w-fit">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: "absolute",
                    width: "20px",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <FaImages className={`text-xl cursor-pointer ${
                    darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-neutral-700 hover:text-sky-500'
                  }`} />
                </motion.div>
              </div>
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <MdEmojiEmotions
                  onClick={() => setShowPicker((prev) => !prev)}
                  className={`text-xl cursor-pointer ${
                    darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-neutral-700 hover:text-sky-500'
                  }`}
                />
              </motion.div>
            </div>

            {loader ? (
              <LoadingButtonFit text="Loading..." darkMode={darkMode} />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitComment}
                disabled={!commentPostData.comment?.trim()}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  !commentPostData.comment?.trim()
                    ? (darkMode 
                      ? 'border-gray-700 text-gray-600 cursor-not-allowed' 
                      : 'border-gray-300 text-gray-400 cursor-not-allowed')
                    : (darkMode 
                      ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-gray-900' 
                      : 'border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white')
                } border`}
              >
                {commentPostData.commentId !== undefined ? "Update" : "Comment"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommentPopup;