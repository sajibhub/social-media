import  { useState } from "react";
import authorStore from "@/store/authorStore.js";
import toast from "react-hot-toast";

const ChangePasswordComponent = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");
    const [error, setError] = useState("");
    const [loader, setLoader] = useState(false);

    const {updateProfileReq} =authorStore()

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match!");
            return;
        }

        let reqData= {
            oldPassword :oldPassword,
            newPassword :newPassword
        }
        setLoader(true)
        const res = await updateProfileReq(reqData);
        setLoader(false)
        setError("");
        if(res){
            toast.success("Change Password Successfully");
        }

        else {
            toast.error("Change Password Failed");
        }

    };

    const checkPasswordStrength = (password) => {
        if (password.length < 6) {
            setPasswordStrength("Weak");
        } else if (password.length < 10) {
            setPasswordStrength("Moderate");
        } else {
            setPasswordStrength("Strong");
        }
    };

    return (
        <div className="p-4 lg:p-8">
            <h2 className="text-xl font-semibold text-center text-gray-700  mb-3 lg:mb-6">
                Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Old Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Old Password
                    </label>
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter old password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-2 text-gray-500"
                        >
                            {showOldPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                checkPasswordStrength(e.target.value);
                            }}
                            placeholder="Enter new password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2 text-gray-500"
                        >
                            {showNewPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {passwordStrength && (
                        <p
                            className={`mt-1 text-sm ${
                                passwordStrength === "Weak"
                                    ? "text-red-500"
                                    : passwordStrength === "Moderate"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                            }`}
                        >
                            Password Strength: {passwordStrength}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2 text-gray-500"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition duration-300"
                >
                    {
                        loader ? <div className="loader"></div> : "Change Password"
                    }

                </button>
            </form>

            <div className="py-[28px] lg:py-0"></div>
        </div>
    );
};

export default ChangePasswordComponent;
