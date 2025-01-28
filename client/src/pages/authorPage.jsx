
import SignIn from "../Component/author/SignIn.jsx";
import SignUp from "../Component/author/SignUp.jsx";
import OtpRequestPopup from "@/popup/OtpRequestPopup.jsx";
import PasswordPopup from "@/popup/PasswordPopup.jsx";
import uiManage from "../store/uiManage.js";
import authorStore from "@/store/authorStore.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthorPage = () => {
    const navigate = useNavigate();
    const { author, SendOpt, Password } = uiManage();
    const { readProfileReq } = authorStore();

    useEffect(() => {
        (async () => {
            const res = await readProfileReq("me");
            if (res) {
                navigate("/");
            }
        })();
    }, []);

    return (
        <>
            {SendOpt !== null && <OtpRequestPopup />}
            {Password !== null && <PasswordPopup />}

            <div className="grid grid-cols-3 lg:grid-cols-5 h-screen overflow-y-auto">
                {/* Left Panel */}
                <div
                    className="relative col-span-3 lg:col-span-3 flex flex-col justify-end items-center h-full
                         bg-sky-50
                    "
                >


                        <img
                            className="min-w-full min-h-full object-cover"
                            src="/image/login_photo.png"
                            alt="Login Visual"
                        />

                </div>

                {/* Right Panel */}
                <div className="col-span-3 lg:col-span-2 w-full h-full border-2 border-sky-50 lg:px-5 ">
                    {author === "signIn" && <SignIn/>}
                    {author === "signUp" && <SignUp />}
                </div>
            </div>
        </>
    );
};

export default AuthorPage;
