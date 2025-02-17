import { useNavigate, useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { FaAngleLeft, FaChevronRight, } from "react-icons/fa";
import StoryStore from "@/store/StoryStore.js";
import { CiMenuKebab } from "react-icons/ci";
import VerifiedBadge from "../utility/VerifyBadge";


const PreviewStoryComponent = () => {
    const navigate = useNavigate();

    const [scrollCount, setScrollCount] = useState(0);
    const [scrollMaxCount, setScrollMaxCount] = useState(1);
    const [previewControl, setPreviewControl] = useState(0);
    const [previewMax, setPreviewMax] = useState(0);


    const { StoryData, StoryReq, clearStoreData } = StoryStore()
    const { id } = useParams();
    const myId = parseInt(id)

    useEffect(() => {
        (
            async () => {
                clearStoreData()
                await StoryReq()
                setScrollCount(myId)
                setScrollMaxCount(StoryData.length - 3)
            }
        )()
    }, [])



    const Header = () => {
        return (
            <div className="flex items-center justify-between w-full absolute top-5">
                <img
                    src="/image/logo.png"
                    alt="logo"
                    className="h-14 w-auto  cursor-pointer"
                    onClick={() => navigate("/")}
                />

                <IoMdClose
                    onClick={
                        () => navigate(-1)
                    }
                    className="text-3xl text-sky-600 cursor-pointer"
                />
            </div>
        )
    }
    const EditStoryView = () => {
        return (
            <div>
                <CiMenuKebab className="text-white font-semibold text-xl" />

                <div>

                </div>
            </div>
        )
    }
    const StoryActiveCard = ({ story, id }) => {
        return (
            <>
                {
                    story.map((story, index) => {


                        return (
                            <>
                                {
                                    index === id && (
                                        <div
                                            key={index}
                                            className="relative   rounded-xl overflow-hidden border border-sky-100
                                              h-full shadow-2xl "
                                        >
                                            {/* Background Image */}

                                            <ActiveBG data={story.stories} />


                                            <div className="absolute inset-0  bg-opacity-30"></div>

                                            <div
                                                className="absolute top-0 left-0 p-3 flex items-center justify-between w-full">
                                                {/* Profile Picture */}
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className=" w-10 h-10 border-2 border-blue-500 rounded-full overflow-hidden">
                                                        <img
                                                            src={story.profile}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* User Name */}
                                                    <p className="text-white text-base font-medium flex justify-center items-center gap-2">
                                                        {story.fullName}
                                                        <VerifiedBadge isVerified={story.verify} />
                                                    </p>
                                                </div>

                                                {/* Post Create Time & edit option */}
                                                <div className="flex justify-end items-center gap-3">
                                                    <p className="text-white text-sm font-normal">
                                                        {story.time}
                                                    </p>
                                                    <EditStoryView />
                                                </div>
                                            </div>

                                            <ActiveIndicator data={story.stories} />

                                            <h1 className=" text-center text-lg absolute bottom-5 text-white font-medium w-full">
                                                {story.text}
                                            </h1>
                                        </div>

                                    )
                                }
                            </>
                        )
                    })
                }
            </>
        );
    };
    const ActiveBG = ({ data }) => {

        useEffect(() => {
            setPreviewMax(data.length - 1)
        }, [data]);

        return (
            <>
                {
                    data.map((item, index) => {
                        return (
                            <div className="absolute top-0 left-0 h-full" key={index}>
                                {
                                    index === previewControl && (
                                        <img
                                            src={(item.image)}
                                            alt="Story"
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                }

                            </div>
                        )
                    })
                }
            </>
        )
    }
    const ActiveIndicator = ({ data }) => {
        return (
            <div className="px-4 absolute top-16 left-0 flex gap-2  w-full">
                {
                    data.map((item, index) => {
                        return (
                            <>
                                {
                                    index === previewControl && <div className="h-[4px] w-[50px] bg-sky-500 rounded-full" key={index}></div>
                                }
                                {
                                    index !== previewControl && <div onClick={() => setPreviewControl(index)} className="h-[4px] w-[30px] bg-gray-200 rounded-full" key={index}></div>
                                }
                            </>

                        )
                    })
                }

            </div>
        )
    }
    const StoryCard = ({ story, id }) => {

        return (
            <>
                {
                    story.map((story, index) => {

                        return (
                            <>
                                {
                                    index === id && (
                                        <div
                                            onClick={() => setScrollCount(index - 2)}
                                            key={index}
                                            className="relative  rounded-lg overflow-hidden cursor-pointer border border-sky-50 shadow-xl
                                            h-full
                                        "
                                        >
                                            {/* Background Image */}

                                            <img
                                                src={(story.stories[0].image)}
                                                alt="Story"
                                                className="w-full h-full object-cover"
                                            />


                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

                                            {/* Profile Picture */}

                                            <div className="align-center
                                            flex flex-col items-center justify-end w-[80%]"
                                            >
                                                <div
                                                    className=" w-16 h-16 border-2 border-blue-500 rounded-full overflow-hidden">
                                                    <img
                                                        src={story.profile}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* User Name */}
                                                {/*<p className="mt-2 text-white text-lg font-medium text-center">*/}
                                                {/*    {story.fullName}*/}
                                                {/*</p>*/}
                                            </div>

                                        </div>

                                    )
                                }
                            </>
                        )
                    })
                }
            </>
        );
    };
    const ScrollHandleButton = () => {
        return (
            <div className="flex items-center justify-between align-center  w-[125%]  z-50">
                {
                    scrollCount > -2 ? (
                        <div
                            onClick={() => handleScroll("remove")}
                            className="h-10 w-10 bg-white rounded-full flex justify-center items-center shadow transform hover:scale-110 transition duration-300"
                        >
                            <FaAngleLeft className="text-2xl cursor-pointer text-neutral-800 " />
                        </div>
                    ) : (
                        <div></div>
                    )
                }
                {
                    scrollCount < scrollMaxCount ? (
                        <div
                            onClick={() => handleScroll("add")}
                            className="h-10 w-10 bg-white rounded-full flex justify-center items-center shadow transform hover:scale-110 transition duration-300"
                        >
                            <FaChevronRight className="text-2xl cursor-pointer  text-neutral-700 " />
                        </div>
                    ) : (
                        <div></div>
                    )
                }

            </div>
        )
    }

    const handleScroll = (direction) => {
        setPreviewControl(0)
        if (direction === "add") {
            setScrollMaxCount(StoryData.length - 3)
            setScrollCount(scrollCount + 1)
        }
        if (direction === "remove") {
            setScrollCount(scrollCount - 1)
        }

    }

    if (!StoryData) {
        return (
            <div className="container h-screen mx-auto flex flex-row items-center relative">
                <div className="flex items-center justify-between w-full absolute top-5">
                    <div className="h-14 w-auto bg-gray-300 rounded"></div>
                    <IoMdClose className="text-3xl text-sky-600" />
                </div>

                <div className="grid grid-cols-6 mx-auto h-full gap-8 py-6 max-w-[1400px] max-h-[750px] w-full">
                    <div className="col-span-1 py-36 opacity-25 bg-gray-200 rounded"></div>
                    <div className="col-span-1 py-36 opacity-65 bg-gray-300 rounded"></div>

                    <div className="col-span-2 relative">
                        <div className="h-full w-full bg-gray-400 rounded"></div>
                    </div>

                    <div className="col-span-1 py-36 opacity-65 bg-gray-300 rounded"></div>
                    <div className="col-span-1 py-36 opacity-25 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }
    else {
        return (
            <div
                className="container h-screen mx-auto flex flex-row items-center relative "
            >
                <Header />
                <div className="grid grid-cols-6 mx-auto h-full gap-8 py-6  max-w-[1400px] max-h-[750px] ">
                    <div className="col-span-1 py-36 opacity-25 cursor-pointer">
                        <StoryCard
                            story={StoryData}
                            id={scrollCount}
                        />
                    </div>
                    <div className="col-span-1 py-36 opacity-65 cursor-pointer">
                        <StoryCard
                            story={StoryData}
                            id={1 + scrollCount}
                        />
                    </div>
                    <div className="col-span-2 relative cursor-pointer ">
                        <ScrollHandleButton />
                        <StoryActiveCard
                            story={StoryData}
                            id={2 + scrollCount}
                        />
                    </div>
                    <div className="col-span-1 py-36 opacity-65 cursor-pointer">
                        <StoryCard
                            story={StoryData}
                            id={3 + scrollCount}
                        />
                    </div>
                    <div className="col-span-1 py-36 opacity-25 cursor-pointer">
                        <StoryCard
                            story={StoryData}
                            id={4 + scrollCount}
                        />
                    </div>

                </div>

            </div>
        );
    }

};

export default PreviewStoryComponent;
