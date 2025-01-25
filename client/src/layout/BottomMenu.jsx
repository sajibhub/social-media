import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { RiMessage3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const BottomMenu = () => {
    const navigate = useNavigate(); // Get the navigate function

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
                onClick={() => navigate("/")} // Navigate to home on click
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

            {/* Notifications Icon */}
            <motion.div
                whileHover={{ opacity: 1, scale: 1.1 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                }}
                className="menu mb-3"
                onClick={() => navigate("/notification")} // Navigate to notifications on click
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
                onClick={() => navigate("/messages")} // Navigate to messages on click
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
                onClick={() => navigate("/profile/me")} // Navigate to profile on click
            >
                <FaUser className="text-2xl font-medium" />
            </motion.div>
        </div>
    );
};

export default BottomMenu;
