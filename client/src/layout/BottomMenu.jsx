import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { BsBookmarkFill, BsPlusSquareFill } from "react-icons/bs";
import NotificationBadge from "@/Component/utility/NotificationBadge";
import authorStore from "@/store/authorStore.js";
import { RiMessage3Fill } from "react-icons/ri";

const menuItems = [
  { path: "/", icon: TiHome },
  { path: "/search", icon: FaSearch },
  { path: "/notification", icon: IoMdNotifications, badge: true },
  { path: "/conversations", icon: RiMessage3Fill },
  { path: "/save-post", icon: BsBookmarkFill },
  // { path: "/add-post", icon: BsPlusSquareFill },
  { path: "/profile", icon: FaUser, isProfile: true },
];

const BottomMenu = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const pathname = window.location.pathname;
  const { myProfileData } = authorStore();

  // Helper function to determine if current path matches menu item
  const isActivePath = (path, isProfile) => {
    if (isProfile) {
      return pathname.includes(`/profile/${userName}`);
    }
    return pathname === path;
  };

  return (
    <div className="py-3 w-screen shadow-lg border-t bg-white flex justify-between items-center">
      {menuItems.map(({ path, icon: Icon, badge, isProfile }, index) => (
        <motion.div
          key={index}
          whileHover={{ opacity: 1, scale: 1.1 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, scale: { type: "spring", bounce: 0.5 } }}
          className={`${
            isActivePath(path, isProfile)
              ? "menu-active text-sky-500 mb-3 text-3xl"
              : "menu mb-3 text-2xl"
          } flex-shrink-0 relative`}
          onClick={() =>
            navigate(isProfile ? `/profile/${userName}` : path)
          }
        >
          <Icon className="font-medium" />
          {badge && myProfileData?.notification > 0 && (
            <NotificationBadge count={myProfileData?.notification} />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BottomMenu;
