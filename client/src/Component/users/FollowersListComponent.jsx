import {motion} from "framer-motion";
import authorStore from "@/store/authorStore.js";

import {useNavigate, useParams} from "react-router-dom";
import toast from "react-hot-toast";
import {useState} from "react";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";

const SearchResultComponent = () => {
    const {url} = useParams();
    const navigate = useNavigate();
    const [followLoader, setFollowLoader] = useState({
        status : false,
        id: null
    });

    const { followersList , flowReq , readProfileReq,followingListReq, myProfileData } = authorStore()


    const goToProfile = ( user)=>{
        navigate("/profile/"+user)
    }

    const followHandel = async (id)=>{
        setFollowLoader(
            {
                status : true,
                id: id
            }
        )
        let res = await flowReq(id)
        setFollowLoader(
            {
                status : false,
                id: null
            }
        )
        if(res){


            toast.success("Following Successful")

        }
        else{
            toast.error("Following Fail")
        }
    }

    if (followersList === null) {
        return (
            <div className="mt-4 px-3">

                {
                    [1,1,1,1,1,1,1].map((user,i) => {
                        return (
                            <motion.div
                                key={i}
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
                               h-[40px] w-[40px] flex flex-col items-center justify-center rounded-full bg-sky-50 overflow-hidden
                               '
                                >

                                </div>

                                <div
                                    className="flex-grow py-4 px-10 rounded-md bg-sky-50"
                                >

                                </div>

                                <button
                                    className="py-4 px-10 rounded-full bg-sky-50"
                                >
                                </button>

                            </motion.div>
                        )
                    })
                }

            </div>
        );
    }

    else {
        return (
            <div className="mt-4 px-4">

                {
                    followersList.map((user,i) => {
                        return (
                            <motion.div
                                key={i}
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
                                    onClick={() => goToProfile(user.username)}
                                    className='
                                     h-[40px] w-[40px] flex flex-col items-center justify-center rounded-full  overflow-hidden
                                     '
                                >
                                    <img src={user.profile} alt={""} className="min-w-full min-h-full"/>

                                </div>

                                <div
                                    className="flex-grow"
                                >
                                    <h2
                                        onClick={() => goToProfile(user.username)}
                                        className=" text-base font-medium text-neutral-800">{user.fullName}</h2>
                                    <h2
                                        onClick={() => goToProfile(user.username)}
                                        className="text-sm font-normal text-neutral-700"
                                    >
                                        {user.username}
                                    </h2>
                                </div>

                                {
                                    (followLoader.id === user._id) ? <div className="loader-dark me-5"></div> : (
                                        <button
                                            onClick={() => followHandel(user._id)}
                                            className="hover:text-sky-500 text-sm font-medium"
                                        >
                                            {
                                                user.isFollowing ? "Unfollow" : "Followback"
                                            }

                                        </button>
                                    )
                                }

                            </motion.div>
                        )
                    })
                }

            </div>
        );
    }

};

export default SearchResultComponent;