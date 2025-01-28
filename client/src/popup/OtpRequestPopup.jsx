
import authorStore from "@/store/authorStore.js";
import { useState } from "react";
import toast from "react-hot-toast";
import uiManage from "@/store/uiManage.js";

const OtpRequestPopup = () => {
  const { setOtpSentData, otpSentData, otpReq } = authorStore();
  const { setPassword, setSendOpt } = uiManage();
  const [loading, setLoading] = useState(false);

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
      <div className="fixed inset-0 bg-sky-50 bg-opacity-90 flex items-center justify-center z-50 px-5 ">
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Send OTP</h2>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter your email address to receive a one-time password (OTP):
          </p>

          {/* Input Field */}
          <input
              type="email"
              onChange={(e) => setOtpSentData("email", e.target.value)}
              value={otpSentData?.email}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your email address"
              required
          />

          {/* Send OTP Button */}
          <button
              onClick={sentOpt}
              className={`w-full py-2 rounded-lg text-white ${
                  loading ? "bg-sky-300" : "bg-sky-500 hover:bg-sky-600"
              } focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2`}
              disabled={loading}
          >
            {loading ? <div className="loader w-fit mx-auto"></div> : "Send OTP"}
          </button>
        </div>
      </div>
  );
};

export default OtpRequestPopup;

