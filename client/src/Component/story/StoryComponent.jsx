import {motion} from "framer-motion";
import {useEffect, useRef} from "react";
import {MdAdd, MdKeyboardDoubleArrowRight, MdOutlineKeyboardDoubleArrowLeft,} from "react-icons/md";
import StoryStore from "@/store/StoryStore.js";
import uiManage from "@/store/uiManage.js";
import {useNavigate} from "react-router-dom";

const StoryComponent = () => {
    const navigate = useNavigate();
    const {setCreateStory} = uiManage()
    const scrollRef = useRef(null);
    const {StoryData, StoryReq} = StoryStore()

    useEffect(() => {
        (
           async ()=>{
                await StoryReq()
            }
        )()

    },[])

    const scroll = (direction) => {
        if (direction === "left") {
            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
        } else {
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }

    };


    if(StoryData === null ){
        return (
            <div className="relative px-10 max-w-[680px] mx-auto">
                <div
                    className="
                       absolute left-0 top-0 bg-blur bg-opacity-35
                       h-full bg-gray-200 px-3 z-[300] rounded
                    "
                ></div>
                <div
                    className="
                       absolute right-0 top-0 bg-blur bg-opacity-35
                       h-full bg-gray-200 px-3 z-[300] rounded
                     "
                ></div>
                <div
                    className="mt-3 p-3 scroll-bar-hidden flex flex-row gap-5 overflow-y-auto cursor-pointer"
                >
                    {Array(10)
                        .fill(0)
                        .map((_, i) => (

                            <div
                                key={i}
                                className="max-w-[70px] flex-shrink-0 overflow-hidden"
                            >
                                <div
                                    className="
                                      h-[55px] w-[55px] rounded-full overflow-hidden flex flex-row justify-center items-center
                                      border-[3px] border-gray-300 mx-auto bg-gray-200
                                    "
                                ></div>
                                <div className="h-4 w-20 bg-gray-200 mx-auto rounded mt-2"></div>
                            </div>
                        ))}

                </div>
            </div>

        )
    }


    else {
        return (
            <div className="relative px-10 max-w-[680px] mx-auto">
                <motion.button
                    whileHover={{opacity: 1, scale: 1.2}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                        duration: 0.3,
                        scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                    }}
                    className="
                    absolute left-0 top-0 bg-blur bg-opacity-35
                       h-full bg-white px-3 z-[300]
                    "
                    onClick={() => scroll("left")}
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-neutral-700 text-2xl font-bold"/>
                </motion.button>
                <motion.button
                    whileHover={{opacity: 1, scale: 1.2}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                        duration: 0.3,
                        scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                    }}
                    className="
                    absolute right-0 top-0 bg-blur bg-opacity-35
                       h-full bg-white px-3 z-[300]
                    "
                    onClick={() => scroll("")}
                >
                    <MdKeyboardDoubleArrowRight className="text-neutral-700 text-2xl font-bold" />
                </motion.button>


                <div
                    ref={scrollRef}
                    className="mt-3 p-3  scroll-bar-hidden justify-start  flex flex-row gap-5 overflow-y-auto cursor-pointer
                "
                >
                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{
                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}

                        className="max-w-[80px] flex-shrink-0 overflow-hidden"
                        onClick={()=>setCreateStory(true)}
                    >
                        <div
                            className="
                                     h-[60px] w-[60px] rounded-full overflow-hidden flex flex-row justify-center items-center
                                     border-[3px] border-sky-200 mx-auto bg-neutral-500
                                     "
                        >
                            <MdAdd className="text-white text-2xl " />
                        </div>
                    </motion.div>

                    {
                        StoryData.map((item, i) => {
                            const previewID = i -2 ;
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{opacity: 1, scale: 1.1}}
                                    animate={{opacity: 1, scale: 1}}
                                    transition={{
                                        duration: 0.3,
                                        scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                                    }}
                                    className="max-w-[80px] flex-shrink-0 overflow-hidden"
                                    onClick={()=>navigate("/story/"+ previewID)}
                                >
                                    <div
                                        className="
                                     h-[60px] w-[60px] rounded-full overflow-hidden flex flex-row justify-center items-center
                                     border-[3px] border-sky-200 mx-auto
                                     "
                                    >
                                        <img src={item.user.profile} alt="profile" className="min-w-full min-h-full"/>
                                    </div>
                                </motion.div>
                            )
                        })
                    }

                </div>
            </div>
        );
    }


};

export default StoryComponent;