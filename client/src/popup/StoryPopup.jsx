import {IoClose} from "react-icons/io5";
import ActiveComponent from "@/Component/story/ActiveComponent.jsx";


const StoryPopup = () => {
    return (
        <div
            className="h-screen w-screen absolute top-0 right-0 bg- z-[99999] bg-white bg-opacity-60
            mx-auto flex justify-center items-center overflow-hidden
             "
        >

            <div
                className="
                max-w-[1200px] h-[80%] w-full bg-white shadow-lg
                border rounded mx-3 md:px-0 relative overflow-hidden scroll-bar-hidden
                "
            >
                <button className="block absolute top-3 right-3 ">
                    <IoClose className="text-3xl ms text-sky-500"/>
                </button>


                <div className="h-full w-full grid grid-cols-6 gap-3">
                    <div className="col-span-1 bg-red-200"></div>
                    <div className="col-span-1 bg-red-200"></div>

                    <div className="col-span-2 overflow-auto">
                        <ActiveComponent />
                    </div>
                    <div className="col-span-1 bg-red-200"></div>
                    <div className="col-span-1 bg-red-200"></div>
                </div>


            </div>
        </div>
    );
};

export default StoryPopup;