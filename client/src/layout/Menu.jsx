import {TiHome} from "react-icons/ti";
import {IoMdNotifications} from "react-icons/io";
import {FaBookmark, FaSearch, FaSignOutAlt, FaUser, FaUsers} from "react-icons/fa";
import {RiMessage3Fill, RiStickyNoteAddFill} from "react-icons/ri";
import {IoSettingsSharp} from "react-icons/io5";
import{motion} from "framer-motion";
import {useNavigate} from "react-router-dom";

const Menu = () => {
    const navigate = useNavigate();
    const pathname = window.location.pathname;
    return (
        <>
            <div className=" px-3 scroll-bar-hidden ">
                <img src="/image/logo.png" alt="logo" className="h-[160px] block mx-auto mt-10" />

                <div className="py-3 w-fit mx-auto  ">
                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{
                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}

                        className={pathname === "/" ? "menu-active mb-3" :"menu mb-3"}
                        onClick={() => navigate("/")}

                    >
                        <TiHome className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Home</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <FaSearch className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Search</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <IoMdNotifications className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Notification</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <RiMessage3Fill className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Message</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <FaBookmark className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Save Post</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <FaUsers className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Community</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <RiStickyNoteAddFill className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Add Post</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className={pathname === "/profile" ? "menu-active mb-3" :"menu mb-3"}
                        onClick={() => navigate("/profile")}
                    >
                        <FaUser className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Profile</h3>
                    </motion.div>

                    <hr className="my-5 mb-5 border-b-2 border-gray-100 "/>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-2"
                    >
                        <IoSettingsSharp className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Setting</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{opacity: 1, scale: 1.1}}
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{

                            duration: 0.3,
                            scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                        }}
                        className="menu mb-3"
                    >
                        <FaSignOutAlt className="text-xl font-medium "/>
                        <h3 className="text-lg font-medium  ">Sign Out</h3>
                    </motion.div>

                </div>
            </div>
        </>
    );
};

export default Menu;