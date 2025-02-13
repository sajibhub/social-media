import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import {  useNavigate, useParams } from "react-router-dom";
import { BsBookmarkFill, BsPlusSquareFill } from "react-icons/bs";
import NotificationBadge from "@/Component/utility/NotificationBadge";
import authorStore from "@/store/authorStore.js";

const BottomMenu = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  let userName = localStorage.getItem('userName');
  const pathname = window.location.pathname
  const { myProfileData } = authorStore()

  return (
    <div className="py-3 w-screen shadow-lg border-t bg-white flex flex-row justify-between items-center">
      {/* Home Icon */}
      <motion.div
        whileHover={{ opacity: 1, scale: 1.1 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
        }}
        className={pathname === "/" ? "menu-active text-sky-500 mb-3 text-3xl flex-shrink-0" : "menu mb-3 text-2xl"}
        onClick={() => navigate("/")}
      >
        <TiHome className=" font-medium" />
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
        className={pathname === "/search" ? "menu-active text-sky-500 mb-3 text-3xl flex-shrink-0" : "menu mb-3 text-2xl"}
        onClick={() => navigate("/search")}
      >
        <FaSearch className=" font-medium" />
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
        className={pathname === "/notification" ? "menu-active text-sky-500 mb-3 text-3xl flex-shrink-0 relative" : "menu mb-3 text-2xl relative"}
        onClick={() => navigate("/notification")}
      >
        <IoMdNotifications className="font-medium" />
        {/* Notification Badge */}
        <NotificationBadge count={myProfileData?.notification} />
      </motion.div>

      {/* Save Post Icon */}
      <motion.div
        whileHover={{ opacity: 1, scale: 1.1 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", bounce: 0.5 },
        }}
        className={pathname === "/save-post" ? "menu-active text-sky-500 mb-3 text-2xl flex-shrink-0" : "menu mb-3 text-xl"}
        onClick={() => navigate("/save-post")}
      >
        <BsBookmarkFill className="font-medium" />
      </motion.div>

      {/* Add Post Icon */}
      <motion.div
        whileHover={{ opacity: 1, scale: 1.1 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", bounce: 0.5 },
        }}
        className={pathname === "/add-post" ? "menu-active text-sky-500 mb-3 text-2xl flex-shrink-0" : "menu mb-3 text-xl"}
        onClick={() => navigate("/add-post")}
      >
        <BsPlusSquareFill className="font-medium" />
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
        className={user === userName ? "menu-active text-sky-500 mb-3 text-3xl flex-shrink-0" : "menu mb-3 text-2xl"}
        onClick={() => navigate(`/profile/${userName}`)}
      >
        <FaUser className="font-medium" />
      </motion.div>
    </div>
  );
};

export default BottomMenu;
