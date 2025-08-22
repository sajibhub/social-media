import { FaImages } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdEmojiEmotions } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "../../store/postStore.js";
import LoadingButtonFit from "../button/LoadingButtonFit.jsx";
import authorStore from "../../store/authorStore";

const AddPost = () => {
  const { myProfileData } = authorStore();
  const { newsFeedReq } = postStore();
  const { createPostReq } = postStore();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const textareaRef = useRef(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Simulate profile data loading
  useEffect(() => {
    setTimeout(() => {
      if (myProfileData) {
        setLoadingProfile(false);
      }
    }, 1000);
  }, [myProfileData]);

  // Resize textarea dynamically as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      if (textareaRef.current.scrollHeight > 120) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [text]);

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

  const handleEmojiClick = (emojiData) => {
    let newText = text + emojiData.emoji;
    setText(newText);
  };

  const createPost = async () => {
    setLoading(true);
    const res = await createPostReq(imageFile, text);
    if (res) {
      await newsFeedReq();
      setText("");
      setImage(null);
      setLoading(false);
      toast.success("Post Created Successfully!");
    } else {
      setLoading(false);
      toast.error("Post Creation Failed!");
    }
  };

  // Skeleton loading component
  const Skeleton = () => (
    <motion.div
      whileHover={{ opacity: 1, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
      }}
      className={`max-w-[560px] mx-auto mt-5 rounded-lg shadow-lg border p-6 ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-white border-neutral-200'
      }`}
    >
      {/* Emoji Picker Skeleton */}
      <div className={`absolute top-0 right-0 z-30 w-10 h-10 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}></div>
      
      {/* Profile and Input Section */}
      <div className="flex items-center gap-3 pb-3 border-b-2">
        <div className={`h-[50px] w-[50px] rounded-full ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
        <textarea
          rows={1}
          placeholder="What's on your mind?"
          className={`w-full text-base font-medium flex-grow outline-none p-3 resize-none bg-transparent ${
            darkMode ? 'text-gray-400 placeholder-gray-500' : 'text-neutral-700'
          }`}
          disabled
        />
      </div>
      
      {/* Uploaded Image Skeleton */}
      <div className={`w-full h-[250px] mt-4 rounded-lg shadow-sm border relative ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-300 border-gray-200'
      }`}>
        <div className={`h-[35px] w-[35px] rounded-full absolute top-2 right-2 flex justify-center items-center ${
          darkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}></div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-3 mt-4">
        <div className="flex items-center gap-3">
          <div className={`h-6 w-6 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className={`h-6 w-6 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
        </div>
        <button
          className={`px-4 py-2 rounded-full border-2 transition duration-300 ${
            darkMode 
              ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white' 
              : 'border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white'
          }`}
        >
          Post
        </button>
      </div>
    </motion.div>
  );

  if (myProfileData === null) {
    return <Skeleton />;
  }

  return (
    <motion.div
      whileHover={{ opacity: 1, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
      }}
      className={`max-w-[560px] mx-auto mt-5 rounded-lg shadow-sm lg:shadow-lg border p-4 lg:p-6 ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-white border-neutral-200'
      }`}
    >
      {showPicker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onMouseLeave={() => setShowPicker(false)}
          className={`absolute top-0 right-0 z-30 rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <EmojiPicker 
            className="ms-auto" 
            onEmojiClick={handleEmojiClick}
            theme={darkMode ? "dark" : "light"}
          />
        </motion.div>
      )}
      
      <div className={`flex items-center gap-3 pb-3 border-b-2 ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className={`h-[50px] w-[50px] rounded-full overflow-hidden border-2 ${
          darkMode ? 'border-gray-600' : 'border-neutral-300'
        }`}>
          {loadingProfile ? (
            <div className={`w-full h-full rounded-full animate-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />
          ) : (
            <img
              src={myProfileData.profile}
              alt="profile"
              className="w-full h-full object-cover flex-shrink-0"
            />
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="What's on your mind?"
          className={`w-full text-base font-medium flex-grow outline-none p-3 resize-none bg-transparent ${
            darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-neutral-700'
          }`}
        />
      </div>
      
      {image && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`w-full h-[250px] flex justify-center items-center overflow-hidden relative mt-4 rounded-lg shadow-sm border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setImage(null)}
            className={`h-[35px] w-[35px] rounded-full absolute top-2 right-2 flex justify-center items-center cursor-pointer transition-colors duration-200 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200'
            }`}
          >
            <IoClose className={`text-xl font-semibold ${
              darkMode ? 'text-gray-300' : 'text-neutral-800'
            }`} />
          </motion.button>
          <img
            src={image}
            alt="Uploaded Image"
            className="min-w-full min-h-full object-cover"
          />
        </motion.div>
      )}
      
      <div className="flex justify-between items-center gap-3 mt-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <FaImages className={`text-xl cursor-pointer ${
                darkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-neutral-700 hover:text-sky-500'
              }`} />
            </motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <MdEmojiEmotions
              onClick={() => setShowPicker((prev) => !prev)}
              className={`text-xl cursor-pointer ${
                darkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-neutral-700 hover:text-sky-500'
              }`}
            />
          </motion.div>
        </div>
        
        {loading ? (
          <LoadingButtonFit text="Loading..." darkMode={darkMode} />
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createPost}
            disabled={!text.trim() && !image}
            className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full border-2 transition duration-300 ${
              !text.trim() && !image
                ? (darkMode 
                  ? 'border-gray-700 text-gray-600 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-400 cursor-not-allowed')
                : (darkMode 
                  ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white' 
                  : 'border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white')
            }`}
          >
            Post
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default AddPost;