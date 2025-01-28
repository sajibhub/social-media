

import postStore from "@/store/postStore.js";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import authorStore from "@/store/authorStore.js";

const UpdatePostPopup = () => {
    const { user } = useParams();
    const path = window.location.pathname;

    const {
        updatePostData,
        setUpdatePostData,
        updatePostReq,
        myPostReq,
        clearUpdatePostData,
        newsFeedReq,
    } = postStore();
    const { myProfileData } = authorStore();

    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmojiClick = (emojiData) => {
        let newText = updatePostData.caption + emojiData.emoji;
        setUpdatePostData("caption", newText);
    };

    const updatePost = async () => {
        setLoading(true);
        const res = await updatePostReq(updatePostData);
        clearUpdatePostData(null);
        setLoading(false);

        if (res) {
            toast.success("Post updated successfully");
            if (path === "/") {
                await newsFeedReq();
            } else {
                if (user !== "me") {
                    await myPostReq(user);
                } else {
                    await myPostReq(myProfileData.username);
                }
            }
        } else {
            toast.error("Failed to update post");
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] bg-gray-800 bg-opacity-50 flex items-center justify-center"
        >
            <div
                className="max-w-lg w-full bg-white rounded-xl shadow-xl p-6 relative"
            >
                {/* Header Section */}
                <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                            src={myProfileData.profile}
                            alt="Profile"
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <textarea
                        value={updatePostData.caption}
                        onChange={(e) => setUpdatePostData("caption", e.target.value)}
                        rows={1}
                        placeholder="Type your update here..."
                        className="ml-4 flex-grow text-base font-medium text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-center mt-4">
                    {/* Emoji Picker Icon */}
                    <MdEmojiEmotions
                        onClick={() => setShowPicker((prev) => !prev)}
                        className="text-2xl text-gray-500 cursor-pointer hover:text-sky-500"
                    />

                    {/* Buttons */}
                    <div className="flex gap-4">
                        {/* Cancel Button */}
                        <button
                            onClick={() => clearUpdatePostData(null)}
                            className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:border-sky-500 hover:text-sky-500 transition duration-200"
                        >
                            Cancel
                        </button>

                        {/* Update Button */}
                        {loading ? (
                            <LoadingButtonFit text="Updating..." />
                        ) : (
                            <button
                                onClick={updatePost}
                                className="py-2 px-4 bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition duration-200"
                            >
                                Update Post
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Emoji Picker */}
            {showPicker && (
                <div
                    onMouseLeave={
                        ()=>setShowPicker(false)
                    }
                    className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}
        </div>
    );
};

export default UpdatePostPopup;
