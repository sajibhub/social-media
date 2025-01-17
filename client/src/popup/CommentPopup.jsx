import {IoClose} from "react-icons/io5";
import {FaImages} from "react-icons/fa";
import {MdEmojiEmotions,} from "react-icons/md";
import {useEffect, useState} from "react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "@/store/postStore.js";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import {RiEdit2Fill} from "react-icons/ri";
import {AiFillDelete} from "react-icons/ai";

const CommentPopup = () => {
    const [image, setImage] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const {setCommentPostData,  commentPostData, clearCommentPostData , commentPostReq , myPostReq,commentListReq, commentList  } = postStore()
    const id =  commentPostData.id

    const [loader, setLoader] = useState(false)

    useEffect(() => {
        (
            async ()=>{
                await commentListReq (id)
            }
        )()
    }, []);

    console.log(commentList)

    const handleEmojiClick = (emojiData) => {
        let newCommentPostData = commentPostData.comment + (emojiData.emoji)
        setCommentPostData("comment", newCommentPostData);
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

    const submitComment = async () => {
        setLoader(true)
        let res = await commentPostReq(commentPostData);
        setLoader(false)
        if(res){
            await myPostReq ()
            clearCommentPostData(null)
            toast.success('Comment Create Successfully')
        }
        else {
            toast.error('Comment Create Failed')
        }



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
                        onClick={() => clearCommentPostData(null)}
                        className="text-2xl font-semibold text-neutral-800 cursor-pointer"
                    />
                </div>

                <div className="scroll-bar-hidden  overflow-y-auto h-full pb-64">
                    {
                        commentList === null && <h1 className="text-center font-lg mt-5"> loading .... </h1>
                    }
                    {
                        commentList !== null &&
                        commentList.map((item, index) => {
                            return (

                                <div key={index}
                                     className=" pt-3 pb-1 ps-2 pe-1 border-b mx-4">
                                    <div className="flex flex-row gap-3 justify-start items-start">
                                        <div
                                            className=" flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden flex  justify-center items-center">
                                            <img
                                                src={item.user.profile}
                                                alt="profile image"
                                                className="min-w-full min-h-full "
                                            />
                                        </div>
                                        <div className=" flex-grow">
                                            <h2 className="text-base font-semibold text-neutral-800">
                                                {item.user.fullName}
                                            </h2>
                                            <h2 className="text-base font-normal text-neutral-700 ">
                                                {item.user.username}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm text-neutral-600 ">
                                            {item.comment}
                                        </p>

                                        <div className="flex justify-end items-center gap-3">
                                            <button><RiEdit2Fill className="text-lg font-semibold"/></button>
                                            <button><AiFillDelete className="text-lg font-semibold"/></button>
                                        </div>
                                    </div>

                                </div>

                            )
                        })
                    }
                </div>

                {showPicker && (
                    <div className=" absolute top-0 right-0 z-30">
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
                            value={commentPostData.comment}
                            onChange={(e) => setCommentPostData("comment",e.target.value)}
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


                        {
                            loader ? <LoadingButtonFit text="Loading..." /> : (
                                <button
                                    onClick={submitComment}
                                    className="
                            px-3 py-1 rounded-full border border-sky-500 text-sky-500
                            hover:bg-sky-500 hover:text-sky-50
                            "
                                >
                                    Comment
                                </button>
                            )
                        }


                    </div>

                </div>

            </div>

        </div>
    );
};

export default CommentPopup;