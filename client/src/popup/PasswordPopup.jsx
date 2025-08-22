import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import authorStore from "../store/authorStore.js";
import toast from "react-hot-toast";
import uiManage from "../store/uiManage.js";

const PasswordPopup = () => {
    const { setPassword } = uiManage();
    const { passwordReq, otpSentData } = authorStore();
    const [otp, setOtp] = useState('');
    const [password, setPasswordR] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    const handleSubmit = async () => {
        const data = {
            "email": otpSentData.email,
            "code": otp,
            "password": password
        };
        setLoading(true);
        const res = await passwordReq(data);
        setLoading(false);
        if (res) {
            toast.success("Password set successfully.");
            setPassword(null);
        } else {
            toast.error("Password reset failed.");
        }
    };

    // Close the popup
    const closePopup = () => {
        setPassword(null);
    };

    // Form field component to reduce code duplication
    const FormField = ({ 
        label, 
        type, 
        value, 
        onChange, 
        placeholder, 
        showToggle = false,
        onToggle,
        toggleState
    }) => (
        <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
                {label}:
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        darkMode 
                            ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-cyan-500" 
                            : "bg-white border-gray-300 text-gray-800 focus:ring-sky-500"
                    } border`}
                    placeholder={placeholder}
                    required
                />
                {showToggle && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={onToggle}
                        className={`absolute top-3 right-3 ${
                            darkMode ? "text-gray-400 hover:text-cyan-300" : "text-gray-500 hover:text-sky-500"
                        }`}
                    >
                        {toggleState ? "Hide" : "Show"}
                    </motion.button>
                )}
            </div>
        </div>
    );

    return (
        <div className={`fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center px-5 ${
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
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </motion.button>
                
                {/* Title */}
                <h2 className={`text-2xl font-semibold mb-4 text-center ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                    Set Password
                </h2>
                
                {/* OTP Input */}
                <FormField
                    label="OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                />
                
                {/* Password Input */}
                <FormField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPasswordR(e.target.value)}
                    placeholder="Enter New Password"
                    showToggle={true}
                    onToggle={() => setShowPassword(!showPassword)}
                    toggleState={showPassword}
                />
                
                {/* Submit Button */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    className={`w-full py-3 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        loading 
                            ? (darkMode ? 'bg-cyan-700' : 'bg-sky-300') 
                            : (darkMode ? 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-500' : 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500')
                    }`}
                    disabled={loading}
                >
                    {loading ? <div className="loader mx-auto"></div> : "Submit"}
                </motion.button>
                
                {/* Additional Info */}
                <div className={`mt-4 text-xs text-center ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                    <p>Enter the OTP sent to your email and set a new password.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default PasswordPopup;