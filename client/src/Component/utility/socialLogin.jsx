import { FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";

const SocialLogin = ({ redirectUrl }) => {
    const handleLogin = (provider) => {
        const width = 600;
        const height = 800;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const popup = window.open(
            `https://matrix-social-media-backend.onrender.com/api/v1/user/auth/${provider}`,
            `${provider} Login`,
            `width=${width},height=${height},top=${top},left=${left}`
        );

        const checkPopup = setInterval(() => {
            try {
                if (popup.location && popup.location.href.includes(`https://matrix-media.vercel.app`)) {
                    clearInterval(checkPopup);
                    popup.close();
                    window.location.href = redirectUrl;
                }
            } catch (error) {
            }
            if (popup.closed) {
                clearInterval(checkPopup);
            }
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <h4 className="text-lg font-semibold text-gray-700">or Sign in with</h4>

            <div className="flex gap-4">
                <button
                    onClick={() => handleLogin("google")}
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-300"
                >
                    <FaGoogle size={24} />
                </button>

                <button
                    onClick={() => handleLogin("github")}
                    className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-900 transition duration-300"
                >
                    <FaGithub size={24} />
                </button>

                <button
                    onClick={() => handleLogin("facebook")}
                    className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-900 transition duration-300"
                >
                    <FaFacebook size={24} />
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;