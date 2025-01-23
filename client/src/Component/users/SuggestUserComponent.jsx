import {motion} from "framer-motion";
import authorStore from "@/store/authorStore.js";
import {useEffect, useState} from "react";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
const SuggestUserComponent = () => {
    const navigate = useNavigate();
    const [followLoader, setFollowLoader] = useState({
        status : false,
        id: null
    });
    const {suggestUser ,suggestUserReq , flowReq} = authorStore()
    useEffect(() => {
        (
          async  ()=>{
                await suggestUserReq()
            }
        )()
    }, []);


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
            await suggestUserReq()

        }
        else{
            toast.error("Following Fail")
        }
    }

    const goToProfile = ( user)=>{
            navigate("/profile/"+user)
    }

    return (
        <>
            <div className="mt-5 mx-2 ">
                <h1 className="mb-2 font-medium text-base text-neutral-700">SUGGESTED FOR YOU</h1>

                {
                    suggestUser === null && <h1>loading ...</h1>
                }


                {
                    suggestUser !== null && (
                        <>
                            {
                                suggestUser.map((value, index) => (
                                    <motion.div
                                        key={index}
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
                                            onClick={() => goToProfile(value.username)}
                                            className='
                                             h-[35px] w-[35px] flex flex-col items-center justify-center rounded-full overflow-hidden
                                             '
                                        >
                                            <img className="min-w-full min-h-full" src={value.profile}
                                                 alt="profile picture"/>
                                        </div>

                                        <div
                                            className="flex-grow"
                                        >
                                            <h2
                                                onClick={() => goToProfile(value.username)}
                                                className=" text-base font-medium text-neutral-800">{value.fullName}</h2>
                                            <h2
                                                onClick={() => goToProfile(value.username)}
                                                className="text-sm font-normal text-neutral-700"
                                            >
                                                {value.username}
                                            </h2>
                                        </div>

                                        {
                                            (followLoader.status) && (followLoader.id === value._id) ? <LoadingButtonFit /> : (
                                                <button
                                                    onClick={() => followHandel(value._id)}
                                                    className="hover:text-sky-500"
                                                >
                                                   {
                                                     value.isFollowing ? "follow" : "Unfollow"
                                                   }
                                                </button>
                                            )
                                        }


                                    </motion.div>

                                ))
                            }

                        </>
                    )
                }

            </div>
        </>
    );
};

export default SuggestUserComponent;