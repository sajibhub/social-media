import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillDelete, AiFillLike } from "react-icons/ai";
import { FaCommentDots, FaShare, FaSun, FaMoon } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import { MdEmojiEmotions, MdMoreVert } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import postStore from "../store/postStore.js";
import { useParams, useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import VerifiedBadge from "../Component/utility/VerifyBadge.jsx";
import DynamicText from "../Component/utility/DynamicText.jsx";
import useActiveStore from "../store/useActiveStore.js";

// Centralized theme styles
const getThemeStyles = (darkMode) => ({
  container: darkMode
    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900",
  header: darkMode
    ? "bg-gray-800/80 backdrop-blur-md border-gray-700"
    : "bg-white/80 backdrop-blur-md border-gray-200",
  post: darkMode
    ? "bg-gray-800/50 backdrop-blur-sm border-gray-700"
    : "bg-white/80 backdrop-blur-sm border-gray-200",
  comment: darkMode
    ? "bg-gray-800/50 backdrop-blur-sm border-gray-700"
    : "bg-white/80 backdrop-blur-sm border-gray-200",
  input: darkMode
    ? "bg-transparent text-white placeholder-gray-400"
    : "bg-transparent text-gray-900 placeholder-gray-500",
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const SinglePostPreview = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isUserOnline } = useActiveStore();
  const {
    likePostReq,
    update_Single_Post_data,
    Single_Post_Req,
    Single_Post_Data,
    commentListReq,
    commentList,
    savePostReq,
    commentPostReq,
    updateComment,
    deletePostCommentReq,
    clear_my_post_data,
  } = postStore();

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  const [hoveredComment, setHoveredComment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentData, setCommentData] = useState("");
  const [commentId, setCommentId] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [actionLoading, setActionLoading] = useState({ like: false, save: false, comment: false });
  const emojiPickerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Theme styles
  const styles = getThemeStyles(darkMode);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch post and comments with cleanup
  useEffect(() => {
    const fetchData = async () => {
      abortControllerRef.current = new AbortController();
      try {
        setIsLoading(true);
        setError(null);
        await Promise.all([
          Single_Post_Req(postId, abortControllerRef.current.signal),
          commentListReq(postId, abortControllerRef.current.signal),
        ]);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Failed to load post or comments");
          console.error(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [postId, Single_Post_Req, commentListReq]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleEmojiClick = (emojiData) => {
    setCommentData((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };

  const likePostHandler = async (id, isLike, likes) => {
    setActionLoading((prev) => ({ ...prev, like: true }));
    try {
      const res = await likePostReq(id);
      if (res) {
        const updatedLikes = isLike ? likes - 1 : likes + 1;
        update_Single_Post_data(id, { isLike: !isLike, likes: updatedLikes });
      }
    } catch (err) {
      toast.error("Failed to like post");
    } finally {
      setActionLoading((prev) => ({ ...prev, like: false }));
    }
  };

  const postSaveHandler = async (id, isSave, save) => {
    setActionLoading((prev) => ({ ...prev, save: true }));
    try {
      const res = await savePostReq(id);
      if (res) {
        const updatedSave = isSave ? save - 1 : save + 1;
        update_Single_Post_data(id, { isSave: !isSave, postSave: updatedSave });
      }
    } catch (err) {
      toast.error("Failed to save post");
    } finally {
      setActionLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentData.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setActionLoading((prev) => ({ ...prev, comment: true }));
    try {
      const data = { id: Single_Post_Data?.[0]?._id, comment: commentData };
      const res = commentId
        ? await updateComment({ ...data, commentId })
        : await commentPostReq(data);

      if (res) {
        setCommentData("");
        setCommentId("");
        await commentListReq(postId);
        toast.success(commentId ? "Comment updated successfully" : "Comment added successfully");
      }
    } catch (err) {
      toast.error(`Failed to ${commentId ? "update" : "add"} comment`);
    } finally {
      setActionLoading((prev) => ({ ...prev, comment: false }));
    }
  };

  const commentEdit = (id, text) => {
    setCommentData(text);
    setCommentId(id);
    setHoveredComment(null);
  };

  const deleteCommentHandler = async (id) => {
    setHoveredComment(null);
    try {
      const res = await deletePostCommentReq(Single_Post_Data?.[0]?._id, id);
      if (res) {
        await commentListReq(postId);
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const goToProfile = (isPost, user) => {
    clear_my_post_data();
    navigate(isPost ? "/profile/me" : `/profile/${user}`);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast.error("Sharing is not supported in this browser");
      return;
    }
    try {
      await navigator.share({
        title: "KAM_DEE",
        text: "Check out this post on KAM_DEE!",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Early return for loading or error states
  if (isLoading) {
    return (
      <motion.div
        className={`min-h-screen ${styles.container} font-sans`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg"
          aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
        >
          {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-gray-700 text-xl" />}
        </motion.button>

        <div className={`w-full border-b-2 sticky top-0 z-[999999] ${styles.header}`}>
          <h1 className="text-center text-xl font-medium py-4">Preview Post</h1>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className={darkMode ? "mt-4 text-gray-400" : "mt-4 text-gray-600"}>Loading post...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !Single_Post_Data || Single_Post_Data.length === 0) {
    return (
      <motion.div
        className={`min-h-screen ${styles.container} font-sans`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg"
          aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
        >
          {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-gray-700 text-xl" />}
        </motion.button>

        <div className={`w-full border-b-2 sticky top-0 z-[999999] ${styles.header}`}>
          <h1 className="text-center text-xl font-medium py-4">Preview Post</h1>
        </div>

        <div className="max-w-md mx-auto mt-8 p-4 rounded-lg bg-red-100 border border-red-300 text-red-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error || "Post not found"}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  const post = Single_Post_Data[0];

  return (
    <motion.div
      className={`min-h-screen overflow-y-auto ${styles.container} font-sans`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg"
        aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      >
        {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-gray-700 text-xl" />}
      </motion.button>

      <div className={`w-full border-b-2 sticky top-0 z-[999999] ${styles.header}`}>
        <h1 className="text-center text-xl font-medium py-4">Preview Post</h1>
      </div>

      <motion.div
        className={`pt-3 lg:px-4 my-2 rounded shadow-lg cursor-pointer border ${styles.post}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {showPicker && (
            <motion.div
              ref={emojiPickerRef}
              className="absolute top-0 right-0 z-30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="flex flex-row ms-3 me-5 gap-3 justify-start items-center" variants={itemVariants}>
          <div className="relative">
            <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full overflow-hidden flex flex-row justify-center items-center shadow">
              <motion.img
                whileHover={{ scale: 1.05 }}
                className="min-h-full min-w-full cursor-pointer"
                onClick={() => goToProfile(post.myPost, post.user.username)}
                src={post.user.profile}
                alt={`${post.user.fullName}'s profile`}
              />
              <div
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${isUserOnline(post.user._id) ? "bg-green-500 border-white" : "bg-red-500 border-white"
                  } z-10`}
              ></div>
            </div>
          </div>
          <motion.div className="mb-2 flex-grow" variants={itemVariants}>
            <h2 className="text-base font-medium flex gap-1 items-center w-fit">
              <motion.span
                whileHover={{ scale: 1.05 }}
                onClick={() => goToProfile(post.myPost, post.user.username)}
                className="cursor-pointer hover:underline"
              >
                {post.user.fullName}
              </motion.span>
              {post.user.verify && <VerifiedBadge isVerified={post.user.verify} />}
            </h2>
            <p className="text-base w-fit">{post.time}</p>
          </motion.div>
        </motion.div>

        {post.images !== null && post.caption !== "" && (
          <motion.div variants={itemVariants}>
            <DynamicText text={post.caption} Length={125} TestStyle="text-lg font-normal leading-[120%]" Align="pb-3" />
          </motion.div>
        )}

        <motion.div
          className="px-3 overflow-hidden w-full h-[320px] flex flex-row justify-center items-center bg-gray-50"
          variants={itemVariants}
        >
          {post.images === null ? (
            <div className="max-w-full max-h-full overflow-y-auto p-5">
              <DynamicText text={post.caption} Length={280} Align="flex flex-col" TestStyle="text-2xl font-semibold" />
            </div>
          ) : (
            <motion.img
              whileHover={{ scale: 1.02 }}
              src={post.images}
              alt="Post content"
              className="min-w-full min-h-full object-cover"
            />
          )}
        </motion.div>

        <motion.div className="px-4 py-5 flex flex-row justify-between items-center gap-5" variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => likePostHandler(post._id, post.isLike, post.likes)}
            className="flex flex-row gap-2 justify-start items-center cursor-pointer"
          >
            {actionLoading.like ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            ) : (
              <AiFillLike className={`${post.isLike ? "text-sky-500" : "text-gray-700"} text-lg`} />
            )}
            <h1 className={`text-base font-medium flex gap-1 items-center ${post.isLike ? "text-sky-500" : "text-gray-700"}`}>
              {post.likes} <span className="hidden md:block">Like</span>
            </h1>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-row gap-2 justify-start items-center cursor-pointer"
          >
            <FaCommentDots className="text-gray-700 text-lg" />
            <h1 className="text-base flex flex-row gap-1 font-medium text-gray-700">
              {post.comment} <span className="hidden md:block">Comments</span>
            </h1>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex flex-row gap-2 justify-start items-center cursor-pointer"
          >
            <FaShare className="text-gray-700 text-lg" />
            <h1 className="text-base font-medium text-gray-700">Shares</h1>
          </motion.div>

          <motion.div className="flex flex-row flex-grow gap-2 justify-end items-center" variants={itemVariants}>
            {actionLoading.save ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => postSaveHandler(post._id, post.isSave, post.postSave)}
                className="flex items-center gap-1"
                aria-label={post.isSave ? "Unsave post" : "Save post"}
              >
                <IoBookmark className={`${post.isSave ? "text-sky-500" : "text-gray-700"} text-lg`} />
                <h1 className={`text-base font-medium ${post.isSave ? "text-sky-500" : "text-gray-700"}`}>
                  {post.postSave} Save
                </h1>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className={`shadow-lg border rounded ${styles.comment} px-4`} variants={itemVariants}>
        <div className="pb-[30px]">
          {commentList?.length > 0 ? (
            commentList.map((item, index) => (
              <motion.div
                key={item._id} // Use unique ID instead of index
                className="pt-3 pb-1 border-b my-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex flex-row gap-3 justify-start items-start">
                  <div className="relative">
                    <div className="flex-shrink-0 h-[35px] w-[35px] rounded-full overflow-hidden flex justify-center items-center">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={item.user.profile}
                        alt={`${item.user.fullName}'s profile`}
                        className="min-w-full min-h-full"
                      />
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${isUserOnline(item.user._id) ? "bg-green-500 border-white" : "bg-red-500 border-white"
                          } z-10`}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-base font-semibold">{item.user.fullName}</h2>
                    <h2 className="text-base font-normal text-gray-500">@{item.user.username}</h2>
                  </div>

                  {item.isComment && (
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="cursor-pointer h-[40px] w-[40px] flex flex-col rounded-full hover:bg-gray-100 items-center justify-center"
                        aria-label="Comment options"
                        onClick={() => setHoveredComment(hoveredComment === item._id ? null : item._id)}
                      >
                        <MdMoreVert className="text-2xl text-gray-600 hover:text-gray-800 font-semibold" />
                      </motion.button>
                      <AnimatePresence>
                        {hoveredComment === item._id && (
                          <motion.div
                            onMouseLeave={() => setHoveredComment(null)}
                            className="py-2 bg-white absolute top-0 right-0 shadow-md border rounded z-10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.button
                              whileHover={{ x: 5 }}
                              onClick={() => commentEdit(item._id, item.comment)}
                              className="flex items-center gap-3 py-2 px-4 hover:bg-blue-100 w-full text-left"
                            >
                              <RiEdit2Fill className="text-lg font-semibold text-gray-700" />
                              <h1 className="text-base font-medium text-gray-700">Edit</h1>
                            </motion.button>
                            <motion.button
                              whileHover={{ x: 5 }}
                              onClick={() => deleteCommentHandler(item._id)}
                              className="flex items-center gap-3 py-2 px-4 hover:bg-red-100 w-full text-left"
                            >
                              <AiFillDelete className="text-lg font-semibold text-red-600" />
                              <h1 className="text-base font-medium text-red-600">Delete</h1>
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                <p className="text-lg py-2 text-gray-600">{item.comment}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No comments yet</p>
          )}
        </div>

        <motion.form
          className="md:px-5 py-3 bg-white bg-opacity-80 bg-blur w-full"
          onSubmit={handleCommentSubmit}
          variants={itemVariants}
        >
          <input
            value={commentData}
            onChange={(e) => setCommentData(e.target.value)}
            className={`text-base flex-grow bg-transparent w-full ${styles.input}`}
            placeholder="Type Comment"
            aria-label="Comment input"
          />
          <div className="flex flex-row justify-between gap-3 items-center border-t mt-3 pt-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPicker((prev) => !prev)}
              type="button"
              aria-label="Open emoji picker"
            >
              <MdEmojiEmotions className="text-xl cursor-pointer" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-3 py-1 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white disabled:opacity-50"
              disabled={actionLoading.comment || !commentData.trim()}
            >
              {actionLoading.comment ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              ) : commentId ? (
                "Update"
              ) : (
                "Comment"
              )}
            </motion.button>
          </div>
        </motion.form>
      </motion.div>

      <div className="py-[42px] md:py-0"></div>
    </motion.div>
  );
};

export default SinglePostPreview;