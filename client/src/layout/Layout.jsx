import Menu from "./Menu.jsx";
import Summary from "./Summary.jsx";
import CommentPopup from "@/popup/CommentPopup.jsx";
import uiManage from "@/store/uiManage.js";
import BottomMenu from "@/layout/BottomMenu.jsx";


const Layout = (props) => {
    const {comment } =uiManage()
    return (

        <div className="
        container h-screen overflow-hidden w-full  mb-3 mx-auto grid md:grid-cols-3 lg:grid-cols-4
        ">
            {
                comment && <CommentPopup />
            }

            <div className="col-span-1 h-full hidden md:block scroll-bar-hidden   overflow-y-auto overflow-x-hidden ">
                <Menu />
            </div>
            <div className=" col-span-2 h-full scroll-bar-hidden  overflow-y-auto overflow-x-hidden border-x-2 border-gray-100 ">
                {
                    props.children
                }
            </div>
            <div className="col-span-1 h-full scroll-bar-hidden  hidden lg:block overflow-y-auto overflow-x-hidden ">
                <Summary />
            </div>
            <div className="absolute bottom-0 md:hidden">
                <BottomMenu />
            </div>
        </div>
    );
};

export default Layout;