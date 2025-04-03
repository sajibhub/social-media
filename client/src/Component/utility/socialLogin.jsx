import { FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";
import { useCallback, useEffect } from "react";
import PropTypes from "prop-types";

const SocialLogin = ({ redirectUrl = "/" }) => {
  const handleLogin = useCallback((provider) => {
    const width = 600;
    const height = 800;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const authUrl = `${import.meta.env.VITE_API_URL}/api/v1/user/auth/${provider}`;
    
    const popup = window.open(
      authUrl,
      `${provider}-login`,
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      console.error("Popup blocked. Please allow popups for this site.");
      return;
    }

    let popupChecker;

    const handlePopupMessage = (event) => {
      // Security check: verify the origin
      if (event.origin !== window.location.origin) return;

      if (event.data === "auth-success") {
        cleanup();
        window.location.href = redirectUrl;
      }
    };

    const cleanup = () => {
      clearInterval(popupChecker);
      window.removeEventListener("message", handlePopupMessage);
      if (popup && !popup.closed) popup.close();
    };

    // Check popup status
    popupChecker = setInterval(() => {
      if (!popup || popup.closed) {
        cleanup();
      }
    }, 500);

    // Listen for messages from popup
    window.addEventListener("message", handlePopupMessage);
  }, [redirectUrl]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("message", handleLogin);
    };
  }, []);

  const socialButtons = [
    { provider: "google", Icon: FaGoogle, bgColor: "bg-red-600", hoverColor: "hover:bg-red-700" },
    { provider: "github", Icon: FaGithub, bgColor: "bg-gray-800", hoverColor: "hover:bg-gray-900" },
    { provider: "facebook", Icon: FaFacebook, bgColor: "bg-blue-600", hoverColor: "hover:bg-blue-700" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <h4 className="text-lg font-semibold text-gray-700">Or Sign in with</h4>
      
      <div className="flex gap-4">
        {socialButtons.map(({ provider, Icon, bgColor, hoverColor }) => (
          <button
            key={provider}
            onClick={() => handleLogin(provider)}
            className={`p-3 rounded-full ${bgColor} text-white ${hoverColor} transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${provider === 'google' ? 'red' : provider === 'github' ? 'gray' : 'blue'}-500`}
            aria-label={`Sign in with ${provider}`}
          >
            <Icon size={24} />
          </button>
        ))}
      </div>
    </div>
  );
};

SocialLogin.propTypes = {
  redirectUrl: PropTypes.string,
};

export default SocialLogin;