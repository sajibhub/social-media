import {IoClose} from "react-icons/io5";
import {FaImages} from "react-icons/fa";
import {MdEmojiEmotions,} from "react-icons/md";
import {useState} from "react";
import EmojiPicker from "emoji-picker-react";
import uiManage from "../store/uiManage.js";
import toast from "react-hot-toast";

const CommentPopup = () => {
    const [image, setImage] = useState(null);
    const [text, setText] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    const {setComment} = uiManage()

    const handleEmojiClick = (emojiData) => {
        let newText = text + (emojiData.emoji)
        setText(newText);
        setShowPicker(false);
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

    const submitComment = () => {
        setComment(false)
        toast.success('Comment Create Successfully')
    }
    return (
        <div
            className="h-screen w-screen absolute top-0 right-0 bg- z-[9999999999999] bg-white bg-opacity-60
            mx-auto flex justify-center items-center overflow-hidden
            "
        >

            <div className="
            max-w-[600px] h-[80%] w-full bg-white shadow-lg
            border rounded mx-3 md:px-0 relative overflow-hidden scroll-bar-hidden
            "
            >

                <div
                    className="flex flex-row justify-between items-center pb-3 border-b-2 border-gray-100
                    sticky w-full left-0 z-30 top-0 bg-white bg-blur bg-opacity-70 p-5
                    "
                >
                    <h2 className="text-lg text-neutral-700 font-semibold">Add Comment</h2>
                    <IoClose
                        onClick={() => setComment(false)}
                        className="text-2xl font-semibold text-neutral-800 cursor-pointer"
                    />
                </div>

                <div className="scroll-bar-hidden  overflow-y-auto h-full pb-64">
                    {
                        [ 1,1,1,1,1,1,1,1].map((item, index) => {
                            return (

                                <div key={index} className="flex flex-row gap-3 justify-start items-start pt-3 px-5">
                                    <div
                                        className=" mt-2 flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden flex flex-row justify-center items-center">
                                        <img
                                            src="/image/profile.jpg"
                                            alt="profile image"
                                            className="min-w-full min-h-full "
                                        />
                                    </div>
                                    <div className="mb-2 flex-grow">
                                        <h2 className="text-base font-medium text-neutral-800">
                                            Imran
                                        </h2>
                                        <p className="text-sm text-neutral-600 ">
                                            Kenan Foundation Asia believes in a world where everyone has the
                                            right to build a better life for themselves Kenan Foundation Asia believes in a
                                            world where everyone has the
                                            right to build a better life for themselves
                                        </p>
                                    </div>

                                </div>

                            )
                        })
                    }
                </div>

                {showPicker && (
                    <div className=" absolute top-0 right-0 z-30" >
                        <EmojiPicker className="ms-auto" onEmojiClick={handleEmojiClick}/>
                    </div>
                )}

                <div
                    className=" px-5 py-3 absolute bottom-0 left-0
                    bg-white bg-opacity-80 bg-blur shadow w-full
                    "
                >

                    <div className="flex flex-row gap-3 justify-center items-start pb-2 border-b-2 border-gray-100">
                        <div
                            className="
                            flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden
                            flex flex-row justify-center items-center"
                        >
                            <img
                                src="/image/profile.jpg"
                                alt="profile image"
                                className="min-w-full min-h-full "
                            />
                        </div>

                        <textarea
                            rows={2}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="text-base text-neutral-800 flex-grow  bg-transparent w-full"
                            placeholder="Type Comment"
                        />

                    </div>

                    {image && (
                        <div className="w-full h-[250px] flex justify-center items-center overflow-hidden relative">
                            <button
                                onClick={() => setImage(null)}
                                className="
                                h-[35px] w-[35px] bg-white rounded-full  cursor-pointer absolute top-3 right-3
                                justify-center items-center hover:shadow
                                "
                            >
                                <IoClose
                                    className="
                                    mx-auto
                                text-2xl font-semibold text-neutral-800
                                "
                                />
                            </button>
                            <img
                                src={image}
                                alt="Uploaded Device"
                                className="min-w-full min-h-full "
                            />
                        </div>
                    )}

                    <div className="flex flex-row justify-between gap-3 items-center pt-3">
                        <div className=" flex flex-row justify-start gap-3 items-center">
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
                                <FaImages
                                    className="text-xl text-neutral-700 cursor-pointer "
                                />
                            </div>
                            <MdEmojiEmotions
                                onClick={() => setShowPicker((prev) => !prev)}
                                className="text-xl text-neutral-700 cursor-pointer "
                            />
                        </div>

                        <button
                            onClick={submitComment}
                            className="
                            px-3 py-1 rounded-full border border-sky-500 text-sky-500
                            hover:bg-sky-500 hover:text-sky-50
                            "
                        >
                            Comment
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default CommentPopup;