import {IoLocation} from "react-icons/io5";

import {motion} from "framer-motion";
import authorStore from "@/store/authorStore.js";

const SummaryProfileComponent = () => {
    const {profileData} = authorStore()

    if(profileData === null || profileData === undefined) {
        return (
            <h1>Loading......</h1>
        )
    }

    else {
        return (
            <>
                <motion.div
                    whileHover={{opacity: 1, scale: 1.05}}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{

                        duration: 0.5,
                        scale: { type: "spring", visualDuration: 0.1, bounce: 0.1 },
                    }}
                    className="mx-2 mt-2  rounded border-2 border-gray-100 overflow-hidden cursor-pointer
                "
                >

                    <div className="h-[100px] w-full overflow-hidden flex flex-row justify-between items-center ">
                        <img src={profileData.cover} alt="Cover Photo" className="min-w-full min-h-full" />
                    </div>
                    <div
                        className="
                    h-[70px] w-[70px] rounded-full overflow-hidden flex flex-row
                     justify-between items-center mx-[10px] mt-[-35px]
                     "
                    >
                        <img src={profileData.profile} alt="Cover Photo" className="min-w-full min-h-full"/>
                    </div>

                    <div className="mx-[15px] pb-3 mt-3">
                        <h1 className="text-xl font-medium text-neutral-700">
                            {profileData.fullName}
                        </h1>
                        <h3 className="text-base font-normal text-neutral-700">
                            User Experience Designer at LIDI
                        </h3>
                        <div className="flex flex-row justify-start items-center mt-1">
                            <IoLocation className="text-lg text-neutral-700" />
                            <p className="text-sm font-medium ms-1 text-neutral-600">
                                Dhaka, Dhaka
                            </p>
                        </div>
                    </div>
                </motion.div>
            </>
        );
    }

};

export default SummaryProfileComponent;