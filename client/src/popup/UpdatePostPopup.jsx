import postStore from "@/store/postStore.js";

import EmojiPicker from "emoji-picker-react";

import {MdEmojiEmotions} from "react-icons/md";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import {useState} from "react";
import toast from "react-hot-toast";



const UpdatePostPopup = () => {
    const {updatePostData , setUpdatePostData , updatePostReq, myPostReq ,clearUpdatePostData} = postStore()

    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmojiClick = (emojiData) => {
        let newText = updatePostData.caption + (emojiData.emoji)
        setUpdatePostData("caption" ,newText);
        setShowPicker(false);
    };

    const updatePost = async () => {
        setLoading(true);
        const res = await updatePostReq(updatePostData);
        clearUpdatePostData(null)
        setLoading(false)
        {
            res && await myPostReq()
        }
        if (res)(
            toast.success("Update Post successfully")

        )
        else {
            toast.error("Update Post successfully");
        }

    }

    return (
        <div
            className="h-screen w-screen absolute top-0 right-0 bg- z-[9999999999999] bg-white bg-opacity-60
            mx-auto flex justify-center items-center overflow-hidden
            "
        >



            <div className="
            max-w-[600px]  w-full bg-white shadow-lg
            border rounded mx-3 relative overflow-hidden  scroll-bar-hidden p-5
            "
            >


                    <div className="flex flex-row justify-center items-center gap-3 pb-3 border-b-2 border-gray-100 ">
                        <div
                            className="flex flex-row h-[35px] w-[35px] justify-center items-center rounded-full overflow-hidden">
                            <img src="/image/profile.jpg" alt="profile image" className="min-w-full min-h-full "/>
                        </div>
                        <textarea
                            value={updatePostData.caption}
                            onChange={(e) => setUpdatePostData("caption", e.target.value)}
                            rows={1} placeholder="Type Here"
                            className="text-base font-medium text-neutral-700 flex-grow"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center gap-3 mt-4 ">

                        <MdEmojiEmotions
                            onClick={() => setShowPicker((prev) => !prev)}
                            className="text-xl text-neutral-700 cursor-pointer "
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={()=>clearUpdatePostData (null)}
                                className="
                            text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500
                            rounded-full hover:text-sky-500 hover:border-sky-500
                            ">
                                Cancel
                            </button>

                            {
                                loading ? <LoadingButtonFit text="loading"/> : (
                                    <button
                                        onClick={updatePost}

                                        className="
                            text-base font-medium text-white bg-sky-500 py-1 px-3 border-2 border-sky-500
                            rounded-full hover:text-sky-500 hover:border-sky-500 bg-sky-000 hover:bg-transparent
                            "
                                    >
                                        Update Post
                                    </button>
                                )
                            }
                        </div>

                    </div>
            </div>

            {showPicker && (
                <div className="absolute top-0 left-[50%] translate-x-[-50%]">
                    <EmojiPicker className="ms-auto" onEmojiClick={handleEmojiClick}/>
                </div>
            )}

        </div>
    );
};

export default UpdatePostPopup;