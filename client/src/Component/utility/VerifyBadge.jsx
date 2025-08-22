import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdVerified } from "react-icons/md";

const VerifiedBadge = ({ isVerified, darkMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Don't render anything if not verified
  if (!isVerified) return null;

  return (
    <div className="relative inline-block">
      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative"
        title="Verified Account"
      >
        <MdVerified
          className={`text-xl cursor-pointer transition-colors duration-300 ${
            darkMode 
              ? (isHovered ? "text-cyan-400" : "text-cyan-500") 
              : (isHovered ? "text-green-500" : "text-blue-500")
          }`}
        />
        
        {/* Subtle glow effect on hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 rounded-full blur-sm ${
              darkMode ? "bg-cyan-500/20" : "bg-blue-500/20"
            }`}
            style={{ zIndex: -1 }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default VerifiedBadge;