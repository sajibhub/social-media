
import {IoIosSend} from "react-icons/io";
import {AiFillLike} from "react-icons/ai";


const ActiveComponent = () => {
    return (
        <div className="h-full border-x relative ">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-row mx-3 gap-3 justify-center items-center pt-3">
                    <div
                        className=" flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden flex flex-row justify-center items-center">
                        <img
                            src="/image/profile.jpg"
                            alt="profile image"
                            className="min-w-full min-h-full"
                        />
                    </div>
                    <div className="mb-2 flex-grow">
                        <h2 className="text-sm font-medium text-neutral-800">
                            Imran Hossen
                        </h2>
                        <p className="text-sm text-neutral-600 ">
                            Front-end Developer
                        </p>
                    </div>

                    <button className="text-sm font-medium text-neutral-800 hover:text-sky-500">
                        Follow
                    </button>
                </div>

                <div
                    className=" px-3 py-3  bottom-0 flex items-center gap-3
                    w-full
                "
                >
                    <input
                        className=" px-3 py-1 border border-sky-20 rounded-full flex-grow bg-transparent"
                    />
                    <button>
                        <AiFillLike className="text-xl text-neutral-700"/>
                    </button>

                    <button>
                        <IoIosSend className="text-2xl text-neutral-700"/>
                    </button>

                </div>
            </div>

            <div className="p-5  bg-red-500 absolute z-[-1] h-full w-full top-0">

            </div>

        </div>
    );
};

export default ActiveComponent;