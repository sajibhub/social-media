import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const LoadingButton = ({ text, darkMode, disabled = false, className = "" }) => {
    const [isPulsing, setIsPulsing] = useState(false);

    // Add pulse effect when button is in loading state
    useEffect(() => {
        if (!disabled) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [disabled]);

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`
                w-full py-3 rounded-lg font-medium flex items-center justify-center gap-3
                focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300
                ${disabled 
                    ? (darkMode 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                    : (darkMode 
                        ? 'bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-500' 
                        : 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500')
                }
                ${className}
            `}
            disabled={disabled}
        >
            <div className={`loader ${darkMode ? 'loader-dark' : ''}`}></div>
            <span>{text}</span>
            
            {/* Pulse effect overlay */}
            {isPulsing && !disabled && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.3, scale: 1.2 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className={`absolute inset-0 rounded-lg ${
                        darkMode ? 'bg-cyan-500/20' : 'bg-sky-500/20'
                    }`}
                />
            )}
        </motion.button>
    );
};

export default LoadingButton;