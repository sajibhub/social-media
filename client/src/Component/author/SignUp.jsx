import uiManage from "../../store/uiManage.js";
import toast from "react-hot-toast";
import { useState } from "react";
import authorStore from "@/store/authorStore.js";
import SocialLogin from "../utility/socialLogin.jsx";

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Provide default empty object if authorStore values are undefined
    const { 
        signUpFrom = {
            username: '',
            fullName: '',
            email: '',
            phone: '',
            password: ''
        }, 
        setSignUpFrom, 
        signUpReq 
    } = authorStore();
    const { setAuthor } = uiManage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signUpReq(signUpFrom);
            setLoading(false);

            if (res === 201) {
                toast.success("Your account successfully created!");
                setAuthor("signIn");
            } else {
                toast.error(res?.response?.data?.message || "Signup failed");
            }
        } catch (error) {
            setLoading(false);
            toast.error("An error occurred during signup");
            console.error("Signup error:", error);
        }
    };

    return (
        <div className="flex items-center justify-center lg:min-h-screen">
            <div className="w-full max-w-[650px] bg-white rounded-lg shadow-lg p-8">
                {/* Title */}
                <h2 className="text-3xl lg:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 mb-6 animate-pulse">
                    Sign Up
                </h2>
                
                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Username Input */}
                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={signUpFrom.username || ''}
                            onChange={(e) => setSignUpFrom("username", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    {/* Full Name Input */}
                    <div className="mb-4">
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={signUpFrom.fullName || ''}
                            onChange={(e) => setSignUpFrom("fullName", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={signUpFrom.email || ''}
                            onChange={(e) => setSignUpFrom("email", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="mb-4">
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Phone
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={signUpFrom.phone || ''}
                            onChange={(e) => setSignUpFrom("phone", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4 relative">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={signUpFrom.password || ''}
                                onChange={(e) => setSignUpFrom("password", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    {loading ? (
                        <button
                            type="submit"
                            disabled
                            className="w-full bg-sky-300 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 text-center"
                        >
                            <div className="loader w-fit mx-auto"></div>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        >
                            Sign Up
                        </button>
                    )}
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <a
                        onClick={() => setAuthor("signIn")}
                        className="text-sky-500 hover:underline cursor-pointer"
                    >
                        Sign in
                    </a>
                </p>
                <SocialLogin redirectUrl='/' />
            </div>
        </div>
    );
};

export default SignUp;