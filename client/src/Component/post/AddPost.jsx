import { FaImages,} from "react-icons/fa";

import {motion} from "framer-motion";
import {MdEmojiEmotions} from "react-icons/md";
import {useState} from "react";
import {IoClose} from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "@/store/postStore.js";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import authorStore from "../../store/authorStore";

const AddPost = () => {
    const {myProfileData} =authorStore()
    const {newsFeedReq} = postStore()
    const {createPostReq} = postStore()
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [text, setText] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

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
        let newText = text + (emojiData.emoji)
        setText(newText);
        setShowPicker(false);
    };

    const createPost = async () => {

        setLoading(true);
        const res = await createPostReq(imageFile,text )
        if(res){
            await  newsFeedReq()
            setText("");
            setImage(null);
            setLoading(false);
            toast.success('Post Create Successfully !')
        }
        else {
            setLoading(false);
            toast.error("Post Create failed !")
        }

    }

    return (
        <>
            <motion.div
                whileHover={{opacity: 1, scale: 1.02}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="max-w-[560px] mx-auto mt-5 rounded shadow-md border cursor-pointer p-5"
            >
                {showPicker && (
                    <div className=" absolute top-0 right-0 z-30" >
                        <EmojiPicker className="ms-auto" onEmojiClick={handleEmojiClick}/>
                    </div>
                )}

                <div className="flex flex-row justify-center items-center gap-3 pb-3 border-b-2 border-gray-100 ">
                    <div className="flex flex-row h-[35px] w-[35px] justify-center items-center rounded-full overflow-hidden">
                        <img src={myProfileData?.profile} alt="profile image" className="min-w-full min-h-full "/>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={1} placeholder="Type Here" className="text-base font-medium text-neutral-700 flex-grow"
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

                <div className="flex flex-row justify-between items-center gap-3 mt-4 ">
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
                        loading ?  <LoadingButtonFit text="Loading..." />: (
                            <button
                                onClick={createPost}

                                className="
                        text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500
                         rounded-full hover:text-sky-500 hover:border-sky-500
                         "
                            >
                                Post
                            </button>
                        )
                    }


                </div>
            </motion.div>
        </>
    );
};

export default AddPost;