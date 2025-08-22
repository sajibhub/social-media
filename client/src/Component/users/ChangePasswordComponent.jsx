import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
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
  const [darkMode, setDarkMode] = useState(false);
  const { updateProfileReq } = authorStore();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match!");
      return;
    }
    let reqData = {
      oldPassword: oldPassword,
      newPassword: newPassword,
    };
    setLoader(true);
    const res = await updateProfileReq(reqData);
    setLoader(false);
    setError("");
    if (res) {
      toast.success("Change Password Successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength("");
    } else {
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

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ strength }) => {
    const strengthConfig = {
      Weak: { width: "33%", bgColor: "bg-red-500" },
      Moderate: { width: "66%", bgColor: "bg-yellow-500" },
      Strong: { width: "100%", bgColor: "bg-green-500" },
    };

    const config = strengthConfig[strength] || { width: "0%", bgColor: "bg-gray-300" };

    return (
      <div className="mt-2">
        <div className={`h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${config.bgColor}`}
            style={{ width: config.width }}
          ></div>
        </div>
        <p
          className={`mt-1 text-sm ${
            strength === "Weak"
              ? darkMode ? "text-red-400" : "text-red-500"
              : strength === "Moderate"
                ? darkMode ? "text-yellow-400" : "text-yellow-500"
                : darkMode ? "text-green-400" : "text-green-500"
          }`}
        >
          Password Strength: {strength}
        </p>
      </div>
    );
  };

  // Form field component to reduce code duplication
  const PasswordField = ({
    label,
    value,
    onChange,
    showPassword,
    setShowPassword,
    placeholder,
    showStrength = false,
    strength = "",
  }) => (
    <div>
      <label className={`block text-sm font-medium mb-1 ${
        darkMode ? "text-gray-300" : "text-gray-600"
      }`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-200 focus:ring-cyan-500"
              : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
          } border`}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-3 top-3 ${
            darkMode ? "text-gray-400 hover:text-cyan-400" : "text-gray-500 hover:text-blue-500"
          }`}
        >
          {showPassword ? "Hide" : "Show"}
        </motion.button>
      </div>
      {showStrength && strength && <PasswordStrengthIndicator strength={strength} />}
    </div>
  );

  return (
    <div className={`p-4 lg:p-8 ${darkMode ? "bg-gray-900" : ""}`}>
      <h2 className={`text-xl font-semibold text-center mb-3 lg:mb-6 ${
        darkMode ? "text-gray-100" : "text-gray-700"
      }`}>
        Change Password
      </h2>
      
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handlePasswordChange}
        className={`space-y-6 p-6 rounded-xl shadow-lg max-w-md mx-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Old Password */}
        <PasswordField
          label="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          showPassword={showOldPassword}
          setShowPassword={setShowOldPassword}
          placeholder="Enter old password"
        />

        {/* New Password */}
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            checkPasswordStrength(e.target.value);
          }}
          showPassword={showNewPassword}
          setShowPassword={setShowNewPassword}
          placeholder="Enter new password"
          showStrength={true}
          strength={passwordStrength}
        />

        {/* Confirm Password */}
        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          showPassword={showConfirmPassword}
          setShowPassword={setShowConfirmPassword}
          placeholder="Confirm new password"
        />

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm text-center ${
              darkMode ? "text-red-400" : "text-red-500"
            }`}
          >
            {error}
          </motion.p>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
            darkMode
              ? "bg-cyan-600 text-white hover:bg-cyan-500"
              : "bg-sky-500 text-white hover:bg-sky-600"
          }`}
        >
          {loader ? <div className="loader"></div> : "Change Password"}
        </motion.button>
      </motion.form>
      
      <div className="py-[28px] lg:py-0"></div>
    </div>
  );
};

export default ChangePasswordComponent;