import { FaImages,} from "react-icons/fa";

import {motion} from "framer-motion";
import {MdEmojiEmotions} from "react-icons/md";
const AddPost = () => {
    return (
        <>
            <motion.div
                whileHover={{opacity: 1, scale: 1.02}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="max-w-[560px] mx-auto mt-5 rounded shadow cursor-pointer p-5"
            >
                <div className="flex flex-row justify-center items-center gap-3 pb-3 border-b-2 border-gray-100 ">
                    <div className="flex flex-row h-[35px] w-[35px] justify-center items-center rounded-full overflow-hidden">
                        <img src="/image/profile.jpg" alt="profile image" className="min-w-full min-h-full "/>
                    </div>
                    <textarea rows={1} placeholder="Type Here" className="text-base text-neutral-700 flex-grow" />
                </div>
                <div className="flex flex-row justify-between items-center gap-3 mt-4 ">
                    <div className="flex flex-row gap-3">
                        <FaImages className="text-lg text-neutral-700 " />
                        <MdEmojiEmotions className="text-xl text-neutral-700 " />
                    </div>
                    <button
                        className="
                        text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500
                         rounded-full hover:text-sky-500 hover:border-sky-500
                         "
                    >
                        Post
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default AddPost;