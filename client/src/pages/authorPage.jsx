
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
    const { author, setAuthor, SendOpt, Password } = uiManage();
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

            <div className="grid grid-cols-3 h-screen overflow-y-auto">
                {/* Left Panel */}
                <div className="relative col-span-3 lg:col-span-1 flex flex-col justify-center items-center h-full">
                    <img
                        className="min-h-full min-w-full object-cover"
                        src="/image/login_photo.jpg"
                        alt="Login Visual"
                    />
                    <div className="absolute inset-0 bg-sky-50 bg-opacity-10"></div>

                    <div className="absolute bottom-0 lg:bottom-auto lg:right-0 w-full lg:w-[130px] flex flex-row lg:flex-col">
                        <button
                            onClick={() => setAuthor("signIn")}
                            className={`author-tab ${author === "signIn" ? "author-tab-active" : ""}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setAuthor("signUp")}
                            className={`author-tab ${author === "signUp" ? "author-tab-active" : ""}`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-3 lg:col-span-2 w-full h-full ">
                    {author === "signIn" && <SignIn />}
                    {author === "signUp" && <SignUp />}
                </div>
            </div>
        </>
    );
};

export default AuthorPage;
