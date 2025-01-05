import {motion} from "framer-motion";

const SummarySuggested = () => {
    return (
        <>
            <div className="mt-5 mx-2 ">
                <div className="flex flex-row justify-between items-center mb-3">
                    <h1 className="cursor-pointer font-medium text-base text-neutral-700">SUGGESTED FOR YOU</h1>
                    <h1 className="cursor-pointer font-medium text-sm text-neutral-800">See all</h1>
                </div>

                {
                    [1,1,1,1,1,11,].map((value, index) => (
                        <motion.div
                            whileHover={{opacity: 1, scale: 1.05}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{

                                duration: 0.5,
                                scale: {type: "spring", visualDuration: 0.1, bounce: 0.1},
                            }}
                            className="
                    cursor-pointer
                    flex flex-row justify-start items-center gap-3 p-3 border rounded mb-2
                    "
                        >
                            <div
                                className='
                            h-[35px] w-[35px] flex flex-col items-center justify-center rounded-full overflow-hidden
                            '
                            >
                                <img className="min-w-full min-h-full" src="/image/profile.jpg" alt="profile picture"/>
                            </div>

                            <div
                                className="flex-grow"
                            >
                                <h2 className=" text-base font-medium text-neutral-800">mahedihasan298</h2>
                                <h2
                                    className="text-sm font-normal text-neutral-700

                                "
                                >Followed by md.miraz.hossain</h2>
                            </div>

                            <button className="text-sm font-medium text-neutral-800 hover:text-sky-500">
                                Follow
                            </button>

                        </motion.div>

                    ))
                }


            </div>
        </>
    );
};

export default SummarySuggested;