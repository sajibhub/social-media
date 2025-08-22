import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import authorStore from "../store/authorStore.js";
import toast from "react-hot-toast";
import uiManage from "../store/uiManage.js";

const OtpRequestPopup = () => {
  const { setOtpSentData, otpSentData, otpReq } = authorStore();
  const { setPassword, setSendOpt } = uiManage();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const sentOpt = async () => {
    setLoading(true);
    const res = await otpReq(otpSentData.email);
    setLoading(false);
    if (res) {
      setSendOpt(null); // Close the popup
      toast.success("OTP request sent successfully");
      setPassword(true);
    } else {
      toast.error("OTP request failed");
    }
  };

  const closePopup = () => {
    setSendOpt(null); // Close the popup
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 px-5 ${
      darkMode ? 'bg-black/70 backdrop-blur-sm' : 'bg-sky-50 bg-opacity-90'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative p-6 rounded-lg shadow-xl max-w-lg w-full ${
          darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
        }`}
      >
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={closePopup}
          className={`absolute top-4 right-4 focus:outline-none ${
            darkMode ? 'text-gray-400 hover:text-cyan-300' : 'text-gray-500 hover:text-gray-800'
          }`}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
        
        {/* Title */}
        <h2 className={`text-2xl font-bold mb-4 text-center ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Send OTP
        </h2>
        
        {/* Description */}
        <p className={`text-sm mb-4 text-center ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Enter your email address to receive a one-time password (OTP):
        </p>
        
        {/* Input Field */}
        <input
          type="email"
          onChange={(e) => setOtpSentData("email", e.target.value)}
          value={otpSentData?.email || ""}
          className={`w-full px-4 py-3 mb-4 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-cyan-500' 
              : 'bg-white border-gray-300 text-gray-800 focus:ring-sky-500'
          } border`}
          placeholder="Enter your email address"
          required
        />
        
        {/* Send OTP Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={sentOpt}
          className={`w-full py-3 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
            loading 
              ? (darkMode ? 'bg-cyan-700' : 'bg-sky-300') 
              : (darkMode ? 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-500' : 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500')
          }`}
          disabled={loading}
        >
          {loading ? <div className="loader w-fit mx-auto"></div> : "Send OTP"}
        </motion.button>
        
        {/* Additional Info */}
        <div className={`mt-4 text-xs text-center ${
          darkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          <p>We'll send a verification code to your email address.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpRequestPopup;