import { FaImages } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdEmojiEmotions } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "@/store/postStore.js";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import authorStore from "@/store/authorStore.js";
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
    const textareaRef = useRef(null);
    const pickerRef = useRef(null);

    useEffect(() => {
        if (myProfileData) {
            setLoadingProfile(false);
        } else {
            setLoadingProfile(true);
        }
    }, [myProfileData]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.style.maxHeight = "120px";
            textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 120 ? "auto" : "hidden";
        }
    }, [text]);

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

    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
        setShowPicker(false);
    };

    const createPost = async () => {
        setLoading(true);
        try {
            const res = await createPostReq(imageFile, text);
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

    return (
        <motion.div
            whileHover={{ opacity: 1, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.3,
                scale: { type: "spring", stiffness: 100, damping: 10 },
            }}
            className="w-screen h-screen absolute top-0 left-0 bg-white bg-opacity-80 z-[999999999]"
        >
            <div className="max-w-[650px] bg-white shadow-lg border rounded-md w-full absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] p-5">
                {showPicker && (
                    <div ref={pickerRef} className="absolute bottom-16 right-5 z-30">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}

                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-100">
                    <div className="h-[50px] w-[50px] rounded-full overflow-hidden border-2 border-neutral-300">
                        {loadingProfile ? (
                            <div className="w-full h-full bg-gray-300 animate-pulse rounded-full" />
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
                        className="w-full text-base font-medium text-neutral-700 flex-grow outline-none p-3 resize-none bg-transparent"
                    />
                </div>

                <div className="w-full h-[300px] bg-gray-50 flex justify-center items-center overflow-hidden relative mt-4 rounded-lg shadow border border-neutral-200">
                    {image ? (
                        <>
                            <button
                                onClick={() => {
                                    setImage(null);
                                    setImageFile(null);
                                }}
                                className="h-[35px] w-[35px] bg-white rounded-full absolute top-2 right-2 flex justify-center items-center hover:bg-gray-200 cursor-pointer"
                            >
                                <IoClose className="text-xl font-semibold text-neutral-800" />
                            </button>
                            <img
                                src={image}
                                alt="Uploaded Image"
                                className="min-w-full min-h-full object-cover"
                            />
                        </>
                    ) : (
                        <img
                            src="/image/image.webp"
                            alt="Default placeholder"
                            className="min-w-full min-h-full object-cover"
                        />
                    )}
                </div>

                <div className="flex justify-between items-center gap-3 mt-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <label htmlFor="image-upload" className="sr-only">Upload Image</label>
                            <input
                                id="image-upload"
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
                            <FaImages
                                className="text-xl text-neutral-700 cursor-pointer hover:text-sky-500 transition duration-200"
                                aria-label="Upload Image"
                            />
                        </div>
                        <MdEmojiEmotions
                            onClick={() => setShowPicker((prev) => !prev)}
                            className="text-xl text-neutral-700 cursor-pointer hover:text-sky-500 transition duration-200"
                            aria-label="Open Emoji Picker"
                        />
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 rounded-full border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition duration-300 me-5"
                        >
                            Cancel
                        </button>
                        {loading ? (
                            <LoadingButtonFit text="Loading..." />
                        ) : (
                            <button
                                onClick={createPost}
                                className="px-6 py-2 rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white transition duration-300"
                            >
                                Post
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AddPost;