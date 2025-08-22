import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SignIn from "../Component/author/SignIn.jsx";
import SignUp from "../Component/author/SignUp.jsx";
import OtpRequestPopup from "../popup/OtpRequestPopup.jsx";
import PasswordPopup from "../popup/PasswordPopup.jsx";
import uiManage from "../store/uiManage.js";
import authorStore from "../store/authorStore.js";
import { useNavigate } from "react-router-dom";

const AuthorPage = () => {
    const navigate = useNavigate();
    const { author, SendOpt, Password } = uiManage();
    const { readProfileReq } = authorStore();
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        (async () => {
            const res = await readProfileReq(localStorage.getItem('userName'));
            if (res) {
                navigate("/");
            }
        })();
    }, []);

    return (
        <>
            {SendOpt !== null && <OtpRequestPopup />}
            {Password !== null && <PasswordPopup />}

            <div className={`grid grid-cols-3 lg:grid-cols-5 h-screen overflow-y-auto ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-white'
                }`}>
                {/* Left Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative col-span-3 lg:col-span-3 flex flex-col justify-end items-center h-full overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10"></div>
                    <img
                        className="min-w-full min-h-full object-cover"
                        src="/image/login_photo.png"
                        alt="Login Visual"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="relative z-20 p-8 lg:p-12 text-center"
                    >
                        <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                            Welcome to Our Community
                        </h1>
                        <p className={`text-lg lg:text-xl max-w-md mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Connect with friends, share your moments, and discover new experiences.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Right Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className={`col-span-3 lg:col-span-2 w-full h-full flex items-center justify-center p-4 lg:p-8 ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-white'
                        }`}
                >
                    <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-sky-50'
                        } rounded-2xl shadow-xl p-6 lg:p-8 border-2`}>
                        {author === "signIn" && <SignIn darkMode={darkMode} />}
                        {author === "signUp" && <SignUp darkMode={darkMode} />}
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default AuthorPage;