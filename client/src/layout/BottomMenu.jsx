
import {motion} from "framer-motion";
import {TiHome} from "react-icons/ti";
import { FaSearch, FaUser,} from "react-icons/fa";
import {IoMdNotifications} from "react-icons/io";
import {RiMessage3Fill} from "react-icons/ri";

const BottomMenu = () => {
    return (
        <>
            <div className="py-3 w-screen bg-white flex flex-row justify-between">
                <motion.div
                    whileHover={{opacity: 1, scale: 1.1}}
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                        duration: 0.3,
                        scale: {type: "spring", visualDuration: 0.3, bounce: 0.5},
                    }}

                    className="menu-active mb-3 flex-shrink-0
                        "
                >
                    <TiHome className="text-2xl font-medium "/>
                    <h3 className="text-xl font-medium  ">Home</h3>
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
                    <FaSearch className="text-2xl font-medium "/>

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
                    <IoMdNotifications className="text-2xl font-medium "/>

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
                    <RiMessage3Fill className="text-2xl font-medium "/>

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
                    <FaUser className="text-2xl font-medium "/>
                </motion.div>

            </div>
        </>
    );
};

export default BottomMenu;