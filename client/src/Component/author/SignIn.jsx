import { useState, useEffect } from "react";
import uiManage from "../../store/uiManage.js";
import authorStore from "@/store/authorStore.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SocialLogin from "../utility/socialLogin.jsx";

const SignIn = () => {
    const navigate = useNavigate();
    const { setAuthor, setSendOpt } = uiManage();
    const { setLoginForm, loginForm, loginReq } = authorStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [labelText, setLabelText] = useState("Username");

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLabelText((prevLabel) => {
                if (prevLabel === "Username") return "Email";
                if (prevLabel === "Email") return "Phone";
                return "Username"; // Cycle back to Username
            });
        }, 2000); // Change every 2 seconds

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        const savedPassword = localStorage.getItem("rememberedPassword");

        if (savedEmail && savedPassword) {
            setLoginForm("username", savedEmail);
            setLoginForm("password", savedPassword);
            setRememberMe(true);
        }
    }, [setLoginForm]);

    const loginHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (rememberMe) {
            localStorage.setItem("rememberedEmail", loginForm.username);
            localStorage.setItem("rememberedPassword", loginForm.password);
        } else {
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("rememberedPassword");
        }

        const res = await loginReq(loginForm);
        setLoading(false);

        if (res === 200) {
            toast.success("Login successfully");
            navigate("/");
        } else {
            toast.error(res.response.data.message);
        }
    };

    const forgotPasswordHandler = () => setSendOpt(true);

    return (
        <div className="flex items-center justify-center lg:min-h-screen">
            <div className="w-full max-w-[650px] bg-white rounded-lg shadow-md p-8 transition-all duration-300 ease-in-out transform hover:scale-105">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 mb-6 animate-pulse">
                    Sign In
                </h2>


                <form onSubmit={loginHandler}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <label
                            htmlFor="loginField"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            <span className="label-text">{labelText}</span>
                        </label>

                        <input
                            id="email"
                            type="text"
                            value={loginForm.username}
                            onChange={(e) => setLoginForm("username", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
                            placeholder={`Enter your ${labelText}`}
                            required
                            aria-label="Email address"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={loginForm.password}
                                onChange={(e) => setLoginForm("password", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
                                placeholder="Enter your password"
                                required
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    {loading ? (
                        <button
                            type="button"
                            className="w-full bg-sky-300 text-white py-2 rounded-lg hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-not-allowed"
                            disabled
                        >
                            <div className="loader w-fit mx-auto"></div>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            aria-label="Sign In"
                        >
                            Sign In
                        </button>
                    )}
                </form>

                {/* Additional Options */}
                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="mr-2 h-4 w-4 border-gray-300 rounded"
                        />
                        Remember me
                    </label>

                    <button
                        onClick={forgotPasswordHandler}
                        className="text-sm text-sky-500 hover:underline"
                        aria-label="Forgot password"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Don’t have an account?{" "}
                    <a
                        onClick={() => setAuthor("signUp")}
                        className="text-sky-500 hover:underline cursor-pointer"
                    >
                        Sign up
                    </a>
                </p>
                <SocialLogin redirectUrl='/' />
            </div>
        </div>
    );
};

export default SignIn;
