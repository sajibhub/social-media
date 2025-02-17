import { motion } from "framer-motion";
import { TiHome } from "react-icons/ti";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { BsBookmarkFill, BsPlusSquareFill } from "react-icons/bs";
import NotificationBadge from "@/Component/utility/NotificationBadge";
import authorStore from "@/store/authorStore.js";

const menuItems = [
  { path: "/", icon: TiHome },
  { path: "/search", icon: FaSearch },
  { path: "/notification", icon: IoMdNotifications, badge: true },
  { path: "/save-post", icon: BsBookmarkFill },
  { path: "/add-post", icon: BsPlusSquareFill },
  { path: "/profile", icon: FaUser, isProfile: true },
];

const BottomMenu = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const pathname = window.location.pathname;
  const { myProfileData } = authorStore();

  return (
    <div className="py-3 w-screen shadow-lg border-t bg-white flex justify-between items-center">
      {menuItems.map(({ path, icon: Icon, badge, isProfile }, index) => (
        <motion.div
          key={index}
          whileHover={{ opacity: 1, scale: 1.1 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, scale: { type: "spring", bounce: 0.5 } }}
          className={`${pathname === (isProfile ? `/profile/${userName}` : path) ? "menu-active text-sky-500 mb-3 text-3xl" : "menu mb-3 text-2xl"} flex-shrink-0 relative`}
          onClick={() => navigate(isProfile ? `/profile/${userName}` : path)}
        >
          <Icon className="font-medium" />
          {badge && <NotificationBadge count={myProfileData?.notification} />}
        </motion.div>
      ))}
    </div>
  );
};

export default BottomMenu;