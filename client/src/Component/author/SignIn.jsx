import React, { useEffect } from "react";
import uiManage from "../../store/uiManage.js";
import authorStore from "@/store/authorStore.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@/Component/button/LoadingButton.jsx";

const SignIn = () => {
  const navigate = useNavigate();
  const { setAuthor, setSendOpt } = uiManage();
  const { setLoginForm, loginForm, loginReq } = authorStore();
  const [loading, setLoading] = React.useState(false);

  const loginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loginReq(loginForm);
    setLoading(false);
    if (res) {
      toast.success("login successfully");
      navigate("/");
    } else {
      toast.error("login error");
    }
  };
  const forgotPasswordHandler = async () => {
    setSendOpt(true);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="max-w-[530px] w-full px-5 md:mx-auto ">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Sign In
        </h2>

        <div className="mt-5">
          <form onSubmit={loginHandler}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email
              </label>
              <input
                value={loginForm.username}
                onChange={(e) => setLoginForm("username", e.target.value)}
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm("password", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 border-gray-300 rounded"
                />
                Remember me
              </label>
              <a className="text-sm text-sky-500 hover:underline">
                Forgot password?
              </a>
            </div>

            {loading ? (
              <LoadingButton text="sign in" />
            ) : (
              <button
                type="submit"
                className="
                            w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 focus:outline-none
                            focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                            flex items-center justify-center gap-3 opacity-70
                            "
              >
                Sign in
              </button>
            )}
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a
              onClick={() => setAuthor("signUp")}
              className="text-sky-500 hover:underline cursor-pointer"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
