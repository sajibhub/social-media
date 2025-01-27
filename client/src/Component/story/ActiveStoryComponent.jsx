import {motion} from "framer-motion";
import {useRef} from "react";
import {MdKeyboardDoubleArrowRight, MdOutlineKeyboardDoubleArrowLeft} from "react-icons/md";

const ActiveStoryComponent = () => {

    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (direction === "left") {
            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
        } else {
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }

    };




    return (
        <div className="active top-0 left-0 w-screen h-screen z-[9999999999] bg-white">

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
                <MdOutlineKeyboardDoubleArrowLeft className="text-neutral-700 text-2xl font-bold" />
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
                className="  scroll-bar-hidden  h-screen  flex flex-row gap-4 overflow-y-auto cursor-pointer

                "
            >

                {
                    Array.from(Array(20).keys()).map((_, i) => (
                        <div
                            className=" flex-shrink-0 h-full overflow-hidden flex justify-center items-center"
                        >
                            <div
                                className="
                                    overflow-hidden rounded flex flex-row justify-center items-center h-[600px] bg-red-50 w-[450px]
                                     "
                            >
                                <img src="/image/profile.jpg" alt="profile" className="min-w-full min-h-full"/>
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    );
};

export default ActiveStoryComponent;

