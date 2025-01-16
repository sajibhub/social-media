import Menu from "./Menu.jsx";
import Summary from "./Summary.jsx";
import CommentPopup from "@/popup/CommentPopup.jsx";
import BottomMenu from "@/layout/BottomMenu.jsx";
import postStore from "@/store/postStore.js";
import UpdatePostPopup from "@/popup/UpdatePostPopup.jsx";



const Layout = (props) => {

    const {updatePostData ,commentPostData} = postStore()
    return (
        <div className="
        container h-screen overflow-hidden w-full  mb-3 mx-auto grid md:grid-cols-3 lg:grid-cols-4
        ">
            {
                commentPostData !== null && <CommentPopup/>
            }

            {
                updatePostData != null && <UpdatePostPopup/>
            }


            <div className="col-span-1 h-full hidden md:block scroll-bar-hidden   overflow-y-auto overflow-x-hidden ">
                <Menu/>
            </div>
            <div
                className=" col-span-2 h-full scroll-bar-hidden  overflow-y-auto overflow-x-hidden border-x-2 border-gray-100 ">
                {
                    props.children
                }
            </div>
            <div className="col-span-1 h-full scroll-bar-hidden  hidden lg:block overflow-y-auto overflow-x-hidden ">
                <Summary/>
            </div>
            <div className="absolute bottom-0 md:hidden">
                <BottomMenu/>
            </div>
        </div>
    );
};

export default Layout;