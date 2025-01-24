import {motion} from "framer-motion";
import authorStore from "@/store/authorStore.js";

const ProfileSummaryComponent = () => {
    const {myProfileData} = authorStore()

    if(myProfileData === null || myProfileData === undefined) {
        return (
            <>
                <div
                    className="mx-2 mt-2 rounded border-2 border-gray-100 overflow-hidden animate-pulse"
                >
                    {/* Cover Photo Skeleton */}
                    <div className="h-[100px] w-full bg-gray-300 shadow"></div>

                    {/* Profile Picture Skeleton */}
                    <div
                        className="
          h-[70px] w-[70px] rounded-full bg-gray-300 mx-[10px] mt-[-35px] shadow
        "
                    ></div>

                    {/* Text Skeleton */}
                    <div className="mx-[15px] pb-3 mt-3 space-y-2">
                        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
            </>
        );
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
                    className="mx-2 mt-2  rounded border-2 shadow border-gray-100 overflow-hidden cursor-pointer
                "
                >

                    <div className="h-[100px] w-full overflow-hidden flex flex-row justify-between items-center shadow ">
                        <img src={myProfileData.cover} alt="Cover Photo" className="min-w-full min-h-full" />
                    </div>
                    <div
                        className="
                    h-[70px] w-[70px] rounded-full overflow-hidden flex flex-row
                     justify-between items-center mx-[10px] mt-[-35px] shadow
                     "
                    >
                        <img src={myProfileData.profile} alt="Cover Photo" className="min-w-full min-h-full"/>
                    </div>

                    <div className="mx-[15px] pb-3 mt-3">
                        <h1 className="text-xl font-medium text-neutral-700">
                            {myProfileData.fullName}
                        </h1>
                        <h3 className="text-base font-normal text-neutral-700">
                            {myProfileData.username}
                        </h3>



                    </div>
                </motion.div>
            </>
        );
    }

};

export default ProfileSummaryComponent;