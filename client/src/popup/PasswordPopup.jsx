import { useState } from 'react';
import authorStore from "@/store/authorStore.js";
import toast from "react-hot-toast";

const PasswordPopup = () => {
    const {passwordReq ,otpSentData} =authorStore()
    const {setPassword} =authorStore()

    const [otp, setOtp] = useState('');
    const [password, setPasswordR] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const data = {
            "email":otpSentData.email,
            "code":otp,
            "password":password
        }
        setLoading(true);
        const res =await passwordReq(data)
        setLoading(false);
        if(res){
            toast.success("Password record successfully.");
            setPassword(null)

        }

        else toast.error("Password record not found.");


    };



    return (
        <div className="fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white rounded-lg p-6 min-w-[500px]">
                <button  className="float-right text-gray-700">&times;</button>
                <h2 className="text-lg font-semibold mb-4">Set Password</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">OTP:</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordR(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {
                        loading ? <div className="loader  mx-auto"></div> : " Submit"
                    }

                </button>
            </div>
        </div>
    );
};

export default PasswordPopup;