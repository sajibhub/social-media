
import { useState } from 'react';
import authorStore from "@/store/authorStore.js";
import toast from "react-hot-toast";
import uiManage from "@/store/uiManage.js";


const PasswordPopup = () => {
    const {setPassword} = uiManage()
    const { passwordReq, otpSentData } = authorStore();

    const [otp, setOtp] = useState('');
    const [password, setPasswordR] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility

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
        setPassword(null); // Close the popup
    };

    return (
        <div className="fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                {/* Close Button */}
                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
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
                </button>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Set Password</h2>

                {/* OTP Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">OTP:</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Enter OTP"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700">Password:</label>
                    <input
                        type={showPassword ? "text" : "password"}  // Toggle password visibility
                        value={password}
                        onChange={(e) => setPasswordR(e.target.value)}
                        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Enter New Password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}  // Toggle the password visibility
                        className="absolute top-[28px] right-3 text-gray-500 hover:text-sky-500"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className={`w-full py-2 rounded-lg text-white ${loading ? "bg-sky-300" : "bg-sky-500 hover:bg-sky-600"} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2`}
                    disabled={loading}
                >
                    {loading ? <div className="loader mx-auto"></div> : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default PasswordPopup;




