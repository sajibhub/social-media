import {TiHome} from "react-icons/ti";
import {IoMdNotifications} from "react-icons/io";
import {FaBookmark, FaSearch, FaSignOutAlt, FaUser, FaUsers} from "react-icons/fa";
import {RiMessage3Fill} from "react-icons/ri";
import {IoSettingsSharp} from "react-icons/io5";


const Menu = () => {
    return (
        <>
            <div className=" px-3 ">
                <img src="/image/I.png" alt="logo" className="h-[50px] block mx-auto mt-10" />

                <div className="py-3   mt-10">
                    <div className="menu-active mb-3">
                        <TiHome className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Home</h3>
                    </div>

                    <div className="menu mb-3">
                        <FaSearch className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Search</h3>
                    </div>

                    <div className="menu mb-3">
                        <IoMdNotifications className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Notification</h3>
                    </div>

                    <div className="menu mb-3">
                        <RiMessage3Fill className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Message</h3>
                    </div>

                    <div className="menu mb-3">
                        <FaBookmark className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Save Post</h3>
                    </div>

                    <div className="menu mb-3">
                        <FaUsers className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Community</h3>
                    </div>

                    <div className="menu mb-3">
                        <FaUser className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Profile</h3>
                    </div>

                    <hr className="my-5 mb-3 border-b-2 border-gray-100 "/>

                    <div className="menu mb-5">
                        <IoSettingsSharp className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Setting</h3>
                    </div>

                    <div className="menu mb-3">
                        <FaSignOutAlt className="text-2xl font-medium "/>
                        <h3 className="text-xl font-medium  ">Sign Out</h3>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Menu;