import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DynamicText = ({ text, Length, Align, TestStyle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    const displayedText = isExpanded ? text : text.slice(0, Length);

    // Don't show the button if text is shorter than the specified length
    const shouldShowButton = text.length > Length;

    return (
        <div className={Align}>
            <motion.p
                className={TestStyle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {displayedText}
                {!isExpanded && shouldShowButton && "..."}
            </motion.p>
            
            {shouldShowButton && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`mt-1 font-medium transition-colors duration-200 ${
                        darkMode 
                            ? "text-cyan-400 hover:text-cyan-300" 
                            : "text-sky-500 hover:text-sky-700"
                    }`}
                >
                    {isExpanded ? "See Less" : "See More"}
                </motion.button>
            )}
        </div>
    );
};

export default DynamicText;