
import uiManage from "../../store/uiManage.js";
import toast from "react-hot-toast";
import {useState} from "react";
import authorStore from "@/store/authorStore.js";

const SignUp = () => {

    const [loading, setLoading] = useState(false);
    const { signUpFrom, setSignUpFrom , signUpReq} = authorStore()
    const {setAuthor} =uiManage()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const res =   await signUpReq(signUpFrom)
        setLoading(false)

        if (res) {
            toast.success(' Your account successfully created!')
            setAuthor('signIn')
        }
        else {
            toast.error("Something went wrong")
        }

    };

    return (
        <div className="flex items-center justify-center lg:min-h-screen ">
            <div className="w-full max-w-[530px] bg-white rounded-lg  p-6">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                    Sign Up
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={signUpFrom.username}
                            onChange={(e)=>setSignUpFrom('username', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={signUpFrom.fullName}
                            onChange={(e)=>setSignUpFrom('fullName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={signUpFrom.email}
                            onChange={(e)=>setSignUpFrom('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Phone
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={signUpFrom.phone}
                            onChange={(e)=>setSignUpFrom('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your phone number"
                            required
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
                            name="password"
                            value={signUpFrom.password}
                            onChange={(e)=>setSignUpFrom('password', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {
                        loading === false? (
                                <button
                                    type={"submit"}
                                    className="w-full bg-sky-500 text-white py-2 rounded-lg
                                hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                                "
                                >
                                    Sign Up
                                </button>
                            ) :
                            (
                                <button
                                    type={"submit"}
                                    className="
                                    w-full bg-sky-300 text-white py-2 rounded-lg
                                     hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                                     text-lg
                                     "
                                >
                                    loading .............

                                </button>
                            )
                    }

                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <a
                        onClick={() => setAuthor('signIn')}
                        className="text-sky-500 hover:underline cursor-pointer">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
