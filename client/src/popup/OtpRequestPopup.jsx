import authorStore from "@/store/authorStore.js";
import {useState} from "react";
import toast from "react-hot-toast";
import uiManage from "@/store/uiManage.js";


const OtpRequestPopup = () => {

  const {setOtpSentData ,otpSentData ,otpReq,  } = authorStore()
  const {setPassword, setSendOpt} = uiManage()
  const [loading, setLoading] = useState(false);

  const sentOpt = async ()=>{

    setLoading(true);
    let res =  await otpReq(otpSentData.email)
    setLoading(false);

    if(res){
      setSendOpt(null)
      toast.success("otp request successfully")
      setPassword(true)
    }
    else {
      toast.error("otp request failed")
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[200000000]">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Send OTP</h2>
        <p className="mb-4 text-gray-700">Enter your phone number to receive an OTP:</p>
        <input 
          type="email"
          onChange={
            (e)=>{
              setOtpSentData("email", e.target.value);
            }
          }
          value={otpSentData?.email}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500" 
          placeholder="Email Address" 
        />
        <button

            onClick={sentOpt}
          className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600
          focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
        >
          {
            loading ? <div className="loader  mx-auto"></div> : "Send OTP"
          }
        </button>
      </div>
    </div>
  );
}

export default OtpRequestPopup;
