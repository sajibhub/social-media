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

const Menu = () => {
    let userName = localStorage.getItem('userName');
    const { SignOutReq } = authorStore();
    const navigate = useNavigate();
    const pathname = window.location.pathname;

    const [signOutLoading, setSignOutLoading] = useState(false);

    const menuItems = [
        { icon: <TiHome />, label: "Home", route: "/" },
        { icon: <FaSearch />, label: "Search", route: "/search" },
        { icon: <IoMdNotifications />, label: "Notification", route: "/notification" },
        { icon: <RiMessage3Fill />, label: "Message", route: "#" },
        { icon: <FaBookmark />, label: "Save Post", route: "/save-post" },
        { icon: <FaUsers />, label: "Community", route: "#" },
        { icon: <RiStickyNoteAddFill />, label: "Add Post", route: "#" },
        { icon: <FaUser />, label: "Profile", route: `/profile/${userName}` }
    ];

    return (
        <>
            <div className="px-3 scroll-bar-hidden">
                <img src="/image/logo.png" alt="logo" className="h-[160px] block mx-auto mt-10" />
                <div className="py-3 w-fit mx-auto">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.route;
                        return (
                            <motion.div
                                key={index}
                                whileHover={{ opacity: 1, scale: 1.1 }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.3,
                                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                                }}
                                className={isActive ? "menu-active mb-3 text-blue-500" : "menu mb-3"}
                                onClick={() => item.route === "#" ? null : navigate(item.route)}
                            >
                                {item.icon}
                                <h3 className="text-lg font-medium">{item.label}</h3>
                            </motion.div>
                        );
                    })}

                    <hr className="my-5 mb-5 border-b-2 border-gray-100" />

                    {/* Settings and Sign Out at the bottom */}
                    <motion.div
                        whileHover={{ opacity: 1, scale: 1.1 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.3,
                            scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                        }}
                        className="menu mb-3"
                    >
                        <IoSettingsSharp className="text-xl font-medium" />
                        <h3 className="text-lg font-medium">Setting</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{ opacity: 1, scale: 1.1 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.3,
                            scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                        }}
                        className="menu mb-3"
                        onClick={async () => {
                            setSignOutLoading(true);
                            const res = await SignOutReq();
                            setSignOutLoading(false);
                            if (res) {
                                navigate("/author");
                                toast.success("Sign Out Successfully");
                            } else {
                                toast.error('Sign Out Fail');
                            }
                        }}
                    >
                        {signOutLoading ? <div className="loader-dark"></div> : <FaSignOutAlt className="text-xl font-medium " />}
                        <h3 className="text-lg font-medium">Sign Out</h3>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Menu;
