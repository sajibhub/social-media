
import { FaImages } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdEmojiEmotions } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "@/store/postStore.js";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
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
  const [loadingProfile, setLoadingProfile] = useState(true); // Profile loading state
  const textareaRef = useRef(null);

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
      textareaRef.current.style.height = "auto"; // Reset height
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
    setShowPicker(false);
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

  if(myProfileData === null) {
    return (
        <motion.div
            whileHover={{opacity: 1, scale: 1.02}}
            animate={{opacity: 1, scale: 1}}
            transition={{
              duration: 0.3,
              scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
            }}
            className="max-w-[560px] mx-auto mt-5 rounded-lg shadow-lg border border-neutral-200 bg-white p-6"
        >
          {/* Emoji Picker */}
          <div className="absolute top-0 right-0 z-30 w-10 h-10 bg-gray-300 rounded"></div>

          {/* Profile and Input Section */}
          <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
            <div className="h-[50px] w-[50px] rounded-full bg-gray-300"></div>
            <textarea
                rows={1}
                placeholder="What's on your mind?"
                className="w-full text-base font-medium text-neutral-700 flex-grow outline-none p-3 resize-none bg-transparent"
            />
          </div>

          {/* Uploaded Image */}
          <div className="w-full h-[250px] mt-4 bg-gray-300 rounded-lg shadow-sm border relative">
            <div
                className="h-[35px] w-[35px] bg-white rounded-full absolute top-2 right-2 flex justify-center items-center hover:bg-gray-200 cursor-pointer"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-3 mt-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
            </div>
            <button
                className="px-4 py-2 rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition duration-300">
              Post
            </button>
          </div>
        </motion.div>

    )
  }

  else {
    return (
        <motion.div
            whileHover={{opacity: 1, scale: 1.02}}
            animate={{opacity: 1, scale: 1}}
            transition={{
              duration: 0.3,
              scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
            }}
            className="max-w-[560px] mx-auto mt-5 rounded-lg shadow-lg border border-neutral-200 bg-white p-6"
        >
          {showPicker && (
              <div className="absolute top-0 right-0 z-30">
                <EmojiPicker className="ms-auto" onEmojiClick={handleEmojiClick}/>
              </div>
          )}

          <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
            <div className="h-[50px] w-[50px] rounded-full overflow-hidden border-2 border-neutral-300">
              {loadingProfile ? (
                  <div className="w-full h-full bg-gray-300 animate-pulse rounded-full"/>
              ) : (
                  <img
                      src={myProfileData.profile}
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
                className="w-full text-base font-medium text-neutral-700 flex-grow outline-none p-3 resize-none bg-transparent"
            />
          </div>

          {image && (
              <div
                  className="w-full h-[250px] flex justify-center items-center overflow-hidden relative mt-4 rounded-lg shadow-sm border">
                <button
                    onClick={() => setImage(null)}
                    className="h-[35px] w-[35px] bg-white rounded-full absolute top-2 right-2 flex justify-center items-center hover:bg-gray-200 cursor-pointer"
                >
                  <IoClose className="text-xl font-semibold text-neutral-800" />
                </button>
                <img
                    src={image}
                    alt="Uploaded Image"
                    className="min-w-full min-h-full object-cover"
                />
              </div>
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
                <FaImages className="text-xl text-neutral-700 cursor-pointer" />
              </div>
              <MdEmojiEmotions
                  onClick={() => setShowPicker((prev) => !prev)}
                  className="text-xl text-neutral-700 cursor-pointer"
              />
            </div>

            {loading ? (
                <LoadingButtonFit text="Loading..." />
            ) : (
                <button
                    onClick={createPost}
                    className="px-4 py-2 rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition duration-300"
                >
                  Post
                </button>
            )}
          </div>
        </motion.div>
    );
  }


};

export default AddPost;

