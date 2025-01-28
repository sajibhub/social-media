import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { BsBookmarkFill, BsPlusSquareFill } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationBadge from "@/Component/utility/NotificationBadge";
import authorStore from "@/store/authorStore.js";

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName");
  const { myProfileData } = authorStore();

  // Define the menu items
  const menuItems = [
    {
      label: "Home",
      path: "/",
      icon: TiHome,
      activeColor: "text-sky-500",
    },
    {
      label: "Search",
      path: "/search",
      icon: FaSearch,
      activeColor: "text-sky-500",
    },
    {
      label: "Notifications",
      path: "/notification",
      icon: IoMdNotifications,
      activeColor: "text-sky-500",
      badgeCount: myProfileData?.notification,
    },
    {
      label: "Save Post",
      path: "/save-post",
      icon: BsBookmarkFill,
      activeColor: "text-sky-500",
    },
    {
      label: "Add Post",
      path: "/add-post",
      icon: BsPlusSquareFill,
      activeColor: "text-sky-500",
    },
    {
      label: "Profile",
      path: `/profile/${userName}`,
      icon: FaUser,
      activeColor: "text-sky-500",
    },
  ];

  return (
    <div className="py-3 w-screen shadow-lg border-t bg-white flex flex-row justify-between items-center">
      {menuItems.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <motion.div
            key={index}
            whileHover={{ opacity: 1, scale: 1.1 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              scale: { type: "spring", bounce: 0.5 },
            }}
            className={`menu ${
              isActive ? item.activeColor : "text-gray-500"
            } mb-3 text-2xl flex-shrink-0 relative`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="font-medium" />
            {item.badgeCount !== undefined && (
              <NotificationBadge count={item.badgeCount} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BottomMenu;
