import { TiHome } from "react-icons/ti";
import { IoMdNotifications } from "react-icons/io";
import { FaBookmark, FaSearch, FaSignOutAlt, FaUser, FaUsers } from "react-icons/fa";
import { RiMessage3Fill, RiStickyNoteAddFill } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import authorStore from "@/store/authorStore.js";
import { useState } from "react";
import toast from "react-hot-toast";
import NotificationBadge from "@/Component/utility/NotificationBadge";

const Menu = () => {
    const { myProfileData } = authorStore()
    let userName = localStorage.getItem("userName");
    const { SignOutReq } = authorStore();
    const navigate = useNavigate();
    const pathname = window.location.pathname

    const [signOutLoading, setSignOutLoading] = useState(false);

    const menuItems = [
        { icon: <TiHome className="text-2xl" />, label: "Home", route: "/" },
        { icon: <FaSearch className="text-2xl" />, label: "Search", route: "/search" },
        {
            icon: (
                <div className="relative">
                    <IoMdNotifications className="text-2xl" />
                    <NotificationBadge count={myProfileData?.notification} />
                </div>
            ),
            label: "Notification",
            route: "/notification",
        },
        { icon: <RiMessage3Fill className="text-2xl" />, label: "Messages", route: { pathname } },
        { icon: <FaBookmark className="text-2xl" />, label: "Saved Posts", route: "/save-post" },
        { icon: <RiStickyNoteAddFill className="text-2xl" />, label: "Add Post", route: "/add-post" },
        { icon: <FaUser className="text-2xl" />, label: "Profile", route: `/profile/${userName}` },
    ];

    return (
        <div className="max-lg:w-[250px] xl:w-72 h-screen px-5 py-8 bg-white  overflow-y-auto scroll-bar-hidden
        fixed top-0 max-lg:left-0  min-lg:left-20 z-50 transition-all duration-300 ease-in-out"
        >
            <img
                src="/image/logo.png"
                alt="logo"
                className="h-14 w-auto mb-8 mx-auto cursor-pointer"
                onClick={() => navigate("/")}
            />

            {/* Menu Items */}
            <div className="space-y-6">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.route;
                    return (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${isActive ? "bg-blue-100 text-blue-500" : "hover:bg-gray-100"
                                }`}
                            onClick={() => navigate(item.route)}
                        >
                            <div className={`icon ${isActive ? "text-blue-500" : "text-gray-600"}`}>
                                {item.icon}
                            </div>
                            <span className="text-lg font-medium">{item.label}</span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Divider */}
            <hr className="my-8 border-gray-200" />

            {/* Settings */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-gray-100"
                onClick={() => navigate("/setting")}
            >
                <IoSettingsSharp className="text-2xl text-gray-600" />
                <span className="text-lg font-medium">Settings</span>
            </motion.div>

            {/* Sign Out */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-4 px-4 py-3 mt-5 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-100"
                onClick={async () => {
                    setSignOutLoading(true);
                    const confirmSignOut = confirm("Are you sure you want to sign out?");
                    if (confirmSignOut) {
                        const res = await SignOutReq();
                        localStorage.clear();
                        setSignOutLoading(false);
                        if (res) {
                            navigate("/author");
                            toast.success("Signed Out Successfully");
                        } else {
                            toast.error("Sign Out Failed");
                        }
                    } else {
                        toast.error("Sign Out Cancelled");
                        setSignOutLoading(false);
                    }
                }}
            >
                {signOutLoading ? (
                    <div className="loader-dark"></div>
                ) : (
                    <FaSignOutAlt className="text-2xl text-red-500" />
                )}
                <span className="text-lg font-medium text-gray-600">Sign Out</span>
            </motion.div>
        </div>
    );
};

export default Menu;
