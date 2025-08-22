import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NotificationBadge = ({ count, darkMode }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  // Initialize pulse animation when count changes
  useEffect(() => {
    if (count > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  // Don't render anything if count is 0 or less
  if (count <= 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ 
        scale: isPulsing ? [1, 1.2, 1] : 1,
      }}
      transition={{ 
        duration: isPulsing ? 0.5 : 0.3,
        ease: "easeInOut"
      }}
      className={`absolute -top-2 -right-2 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm ${
        darkMode 
          ? 'bg-red-500 border-gray-900' 
          : 'bg-red-600 border-white'
      } border`}
    >
      <span className={`${
        darkMode ? 'text-white' : 'text-white'
      }`}>
        {count > 99 ? "99+" : count}
      </span>
    </motion.span>
  );
};

export default NotificationBadge;