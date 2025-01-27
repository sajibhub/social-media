import {motion} from "framer-motion";
import {useRef} from "react";
import {MdKeyboardDoubleArrowRight, MdOutlineKeyboardDoubleArrowLeft} from "react-icons/md";


const StoryComponent = () => {

    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (direction === "left") {
            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
        } else {
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }

    };




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
                className="mt-3 p-3  scroll-bar-hidden   flex flex-row gap-5 overflow-y-auto cursor-pointer
                "
            >

                {
                    Array.from(Array(20).keys()).map((_, i) => (
                        <motion.div
                            key={i}
                            whileHover={{opacity: 1, scale: 1.1}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{
                                duration: 0.3,
                                scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                            }}
                            className="max-w-[70px] flex-shrink-0 overflow-hidden"
                        >
                            <div
                                className="
                                     h-[55px] w-[55px] rounded-full overflow-hidden flex flex-row justify-center items-center
                                     border-[3px] border-sky-500 mx-auto
                                     "
                            >
                                <img src="/image/profile.jpg" alt="profile" className="min-w-full min-h-full"/>
                            </div>
                            <p className="text-sm text-neutral-700 ">menamulhfiroz90</p>
                        </motion.div>
                    ))
                }

            </div>
        </div>
    );
};

export default StoryComponent;