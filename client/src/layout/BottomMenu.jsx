import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { RiMessage3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const BottomMenu = () => {
    const navigate = useNavigate();
    let userName = localStorage.getItem('userName');

    return (
        <div className="py-3 w-screen bg-white flex flex-row justify-between">
            {/* Home Icon */}
            <motion.div
                whileHover={{ opacity: 1, scale: 1.1 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="menu-active mb-3 flex-shrink-0"
                onClick={() => navigate("/")}
            >
                <TiHome className="text-2xl font-medium" />
                <h3 className="text-xl font-medium">Home</h3>
            </motion.div>

            {/* Search Icon */}
            <motion.div
                whileHover={{ opacity: 1, scale: 1.1 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="menu mb-3"
                onClick={() => navigate("/search")} // Navigate to search on click
            >
                <FaSearch className="text-2xl font-medium" />
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
                onClick={() => navigate("/notification")}
            >
                <IoMdNotifications className="text-2xl font-medium" />
            </motion.div>

            {/* Messages Icon */}
            <motion.div
                whileHover={{ opacity: 1, scale: 1.1 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="menu mb-3"
                onClick={() => navigate("/messages")}
            >
                <RiMessage3Fill className="text-2xl font-medium" />
            </motion.div>

            {/* Profile Icon */}
            <motion.div
                whileHover={{ opacity: 1, scale: 1.1 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="menu mb-3"
                onClick={() => navigate(`profile/${userName}`)} 
            >
                <FaUser className="text-2xl font-medium" />
            </motion.div>
        </div>
    );
};

export default BottomMenu;
