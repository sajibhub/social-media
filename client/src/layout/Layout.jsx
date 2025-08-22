import Menu from "./Menu.jsx";
import Summary from "../Component/users/Summary.jsx";
import CommentPopup from "../popup/CommentPopup.jsx";
import BottomMenu from "../layout/BottomMenu.jsx";
import postStore from "../store/postStore.js";
import UpdatePostPopup from "../popup/UpdatePostPopup.jsx";
import UpdateProfilePopup from "../popup/UpdateProfilePopup.jsx";
import uiManage from "../store/uiManage.js";
import StoryCreatorPopup from "../popup/StoryCreatorPopup.jsx";
import { useEffect, useState } from "react";

const Layout = (props) => {
    const { updatePostData, commentPostData } = postStore();
    const { edit_profile_Ui_Control } = uiManage();
    const [darkMode, setDarkMode] = useState(false);
    
    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return (
        <div className={`
            container h-screen overflow-hidden w-full mx-auto grid md:grid-cols-3 lg:grid-cols-4
            ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'}
            transition-colors duration-300
        `}>
            {/* Popups with backdrop blur */}
            <div className="fixed inset-0 z-50 pointer-events-none">
                {commentPostData !== null && (
                    <div className="pointer-events-auto">
                        <CommentPopup darkMode={darkMode} />
                    </div>
                )}
                {updatePostData != null && (
                    <div className="pointer-events-auto">
                        <UpdatePostPopup darkMode={darkMode} />
                    </div>
                )}
                {edit_profile_Ui_Control !== null && (
                    <div className="pointer-events-auto">
                        <UpdateProfilePopup darkMode={darkMode} />
                    </div>
                )}
                <div className="pointer-events-auto">
                    <StoryCreatorPopup darkMode={darkMode} />
                </div>
            </div>
            
            {/* Sidebar Menu */}
            <div className={`
                col-span-1 h-full hidden md:block scroll-bar-hidden overflow-y-auto overflow-x-hidden
                ${darkMode ? 'bg-gradient-to-b from-gray-900/50 to-black/50' : 'bg-gradient-to-b from-white/50 to-gray-50/50'}
                backdrop-blur-sm border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                transition-all duration-300
            `}>
                <Menu />
            </div>
            
            {/* Main Content */}
            <div className={`
                col-span-2 h-full scroll-bar-hidden overflow-y-auto overflow-x-hidden
                ${darkMode ? 'border-x border-gray-800' : 'border-x-2 border-gray-100'}
                transition-all duration-300
            `}>
                {props.children}
            </div>
            
            {/* Summary Sidebar */}
            <div className={`
                col-span-1 h-full scroll-bar-hidden hidden lg:block overflow-y-auto overflow-x-hidden
                ${darkMode ? 'bg-gradient-to-b from-gray-900/50 to-black/50' : 'bg-gradient-to-b from-white/50 to-gray-50/50'}
                backdrop-blur-sm border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                transition-all duration-300
            `}>
                <Summary />
            </div>
            
            {/* Bottom Menu for Mobile */}
            <div className={`
                fixed bottom-0 left-0 right-0 z-40 md:hidden
                ${darkMode ? 'bg-gradient-to-t from-gray-900 to-black/90' : 'bg-gradient-to-t from-white to-gray-50/90'}
                backdrop-blur-sm border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}
                transition-all duration-300
            `}>
                <BottomMenu />
            </div>
        </div>
    );
};

export default Layout;