import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";
import PropTypes from "prop-types";

const SocialLogin = ({ redirectUrl = "/" }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const handleLogin = useCallback((provider) => {
    const width = 600;
    const height = 800;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    const authUrl = `${import.meta.env.VITE_API_URL}/api/v1/user/auth/${provider}`;
    
    const popup = window.open(
      authUrl,
      `${provider}-login`,
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      console.error("Popup blocked. Please allow popups for this site.");
      return;
    }
    
    let popupChecker;
    const handlePopupMessage = (event) => {
      // Security check: verify the origin
      if (event.origin !== window.location.origin) return;
      if (event.data === "auth-success") {
        cleanup();
        window.location.href = redirectUrl;
      }
    };
    
    const cleanup = () => {
      clearInterval(popupChecker);
      window.removeEventListener("message", handlePopupMessage);
      if (popup && !popup.closed) popup.close();
    };
    
    // Check popup status
    popupChecker = setInterval(() => {
      if (!popup || popup.closed) {
        cleanup();
      }
    }, 500);
    
    // Listen for messages from popup
    window.addEventListener("message", handlePopupMessage);
  }, [redirectUrl]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("message", handleLogin);
    };
  }, []);

  const socialButtons = [
    { 
      provider: "google", 
      Icon: FaGoogle, 
      lightBg: "bg-red-600", 
      darkBg: "bg-red-700",
      lightHover: "hover:bg-red-700", 
      darkHover: "hover:bg-red-800",
      lightFocus: "focus:ring-red-500",
      darkFocus: "focus:ring-red-400"
    },
    { 
      provider: "github", 
      Icon: FaGithub, 
      lightBg: "bg-gray-800", 
      darkBg: "bg-gray-700",
      lightHover: "hover:bg-gray-900", 
      darkHover: "hover:bg-gray-600",
      lightFocus: "focus:ring-gray-500",
      darkFocus: "focus:ring-gray-400"
    },
    { 
      provider: "facebook", 
      Icon: FaFacebook, 
      lightBg: "bg-blue-600", 
      darkBg: "bg-blue-700",
      lightHover: "hover:bg-blue-700", 
      darkHover: "hover:bg-blue-800",
      lightFocus: "focus:ring-blue-500",
      darkFocus: "focus:ring-blue-400"
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <h4 className={`text-lg font-semibold ${
        darkMode ? "text-gray-200" : "text-gray-700"
      }`}>
        Or Sign in with
      </h4>
      
      <div className="flex gap-4">
        {socialButtons.map(({ provider, Icon, lightBg, darkBg, lightHover, darkHover, lightFocus, darkFocus }) => (
          <motion.button
            key={provider}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLogin(provider)}
            className={`p-3 rounded-full text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode 
                ? `${darkBg} ${darkHover} ${darkFocus}` 
                : `${lightBg} ${lightHover} ${lightFocus}`
            }`}
            aria-label={`Sign in with ${provider}`}
          >
            <Icon size={24} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

SocialLogin.propTypes = {
  redirectUrl: PropTypes.string,
};

export default SocialLogin;