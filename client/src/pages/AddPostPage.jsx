import { FaImages } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdEmojiEmotions } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "../store/postStore.js";
import LoadingButtonFit from "../Component/button/LoadingButtonFit.jsx";
import authorStore from "../store/authorStore.js";
import { useNavigate } from "react-router-dom";

const AddPost = () => {
  const navigate = useNavigate();
  const { myProfileData } = authorStore();
  const { newsFeedReq, createPostReq } = postStore();

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const textareaRef = useRef(null);
  const pickerRef = useRef(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (myProfileData) {
      setLoadingProfile(false);
    } else {
      setLoadingProfile(true);
    }
  }, [myProfileData]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.maxHeight = "120px";
      textareaRef.current.style.overflowY =
        textareaRef.current.scrollHeight > 120 ? "auto" : "hidden";
    }
  }, [text]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // emoji-picker-react v4+ passes (emojiData, event)
  const handleEmojiClick = (emojiData, event) => {
    setText((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };

  const createPost = async () => {
    if (!text.trim() && !image) {
      toast.error("Please add text or an image to create a post");
      return;
    }

    setLoading(true);
    try {
      // wrap file + text into FormData
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);
      formData.append("text", text);

      const res = await createPostReq(formData);
      if (res) {
        navigate("/");
        await newsFeedReq();
        setText("");
        setImage(null);
        setImageFile(null);
        toast.success("Post Created Successfully!");
      } else {
        throw new Error("No response from server");
      }
    } catch (error) {
      toast.error("Post Creation Failed!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-screen h-screen fixed top-0 left-0 z-[999999999] flex items-center justify-center ${
        darkMode
          ? "bg-black/70 backdrop-blur-sm"
          : "bg-white bg-opacity-80"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`max-w-[650px] w-full rounded-2xl shadow-2xl p-6 ${
          darkMode
            ? "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        } border relative`}
      >
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            ref={pickerRef}
            className="absolute bottom-16 right-5 z-30"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={darkMode ? "dark" : "light"}
            />
          </motion.div>
        )}

        {/* Profile + textarea */}
        <div
          className={`flex items-center gap-3 pb-3 border-b-2 ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <div
            className={`h-[50px] w-[50px] rounded-full overflow-hidden border-2 ${
              darkMode ? "border-gray-600" : "border-neutral-300"
            }`}
          >
            {loadingProfile ? (
              <div
                className={`w-full h-full rounded-full animate-pulse ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              />
            ) : (
              <img
                src={myProfileData?.profile}
                alt="profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="What's on your mind?"
            className={`w-full text-base font-medium flex-grow outline-none p-3 resize-none ${
              darkMode
                ? "bg-transparent text-gray-200 placeholder-gray-500"
                : "bg-transparent text-neutral-700 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Image preview */}
        <div
          className={`w-full h-[300px] flex justify-center items-center overflow-hidden relative mt-4 rounded-xl shadow border ${
            darkMode
              ? "bg-gray-900/50 border-gray-700"
              : "bg-gray-50 border-neutral-200"
          }`}
        >
          {image ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setImage(null);
                  setImageFile(null);
                }}
                className={`h-[35px] w-[35px] rounded-full absolute top-2 right-2 flex justify-center items-center cursor-pointer ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                <IoClose
                  className={`text-xl font-semibold ${
                    darkMode ? "text-gray-300" : "text-neutral-800"
                  }`}
                />
              </motion.button>
              <img
                src={image}
                alt="Uploaded"
                className="min-w-full min-h-full object-cover"
              />
            </>
          ) : (
            <div
              className={`w-full h-full flex flex-col items-center justify-center ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              <FaImages className="text-4xl mb-2" />
              <p>No image selected</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center gap-3 mt-4">
          <div className="flex items-center gap-3">
            {/* Upload image */}
            <div className="relative">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-xl cursor-pointer ${
                  darkMode
                    ? "text-gray-400 hover:text-cyan-400"
                    : "text-neutral-700 hover:text-sky-500"
                }`}
              >
                <FaImages />
              </motion.div>
            </div>

            {/* Emoji */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPicker((prev) => !prev)}
              className={`text-xl cursor-pointer ${
                darkMode
                  ? "text-gray-400 hover:text-cyan-400"
                  : "text-neutral-700 hover:text-sky-500"
              }`}
            >
              <MdEmojiEmotions />
            </motion.div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closePopup}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
              } border`}
            >
              Cancel
            </motion.button>

            {loading ? (
              <LoadingButtonFit text="Loading..." darkMode={darkMode} />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createPost}
                disabled={loading || (!text.trim() && !image)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  !text.trim() && !image
                    ? darkMode
                      ? "border-gray-700 text-gray-600 cursor-not-allowed"
                      : "border-gray-300 text-gray-400 cursor-not-allowed"
                    : darkMode
                    ? "border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                    : "border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
                } border-2`}
              >
                Post
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddPost;
