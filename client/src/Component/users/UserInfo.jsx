import {IoLocation} from "react-icons/io5";


const UserInfo = () => {
    return (
        <div className=" rounded  border border-gray-200 mb-6">
            <div className="h-[200px] w-full overflow-hidden flex flex-row justify-between items-center ">
                <img src="/image/coverPhoto.jpeg" alt="Cover Photo" className="min-w-full min-h-full"/>
            </div>
            <div
                className="
                    h-[100px] w-[100px] rounded-full overflow-hidden flex flex-row
                     justify-between items-center mx-[25px] mt-[-50px]
                     "
            >
                <img src="/image/profile.jpg" alt="Cover Photo" className="min-w-full min-h-full"/>
            </div>

            <div className="mx-[25px] pb-3 mt-3 relative">
                <h1 className="text-2xl font-medium text-neutral-700">
                    MD Enamul Hossen
                </h1>
                <button
                    className="
                    absolute top-[50%] translate-y-[-50%] right-0
                        text-base font-medium text-neutral-700 py-1 px-3 border-2 border-neutral-500
                         rounded-full hover:text-sky-500 hover:border-sky-500
                    "
                >
                    Edit Profile
                </button>
                <h3 className="text-base font-normal text-neutral-700">
                    User Experience Designer at LIDI
                </h3>
                <div className="flex flex-row justify-start items-center mt-1">
                    <IoLocation className="text-lg text-neutral-700"/>
                    <p className="text-sm font-medium ms-1 text-neutral-600">
                        Dhaka, Dhaka
                    </p>
                </div>
            </div>

            <div className=" mx-3">
                <button className="font-medium text-lg py-2 px-3  text-neutral-700 border-b-2 border-neutral-700 ">
                    My Post
                </button>
            </div>

        </div>
    );
};

export default UserInfo;