import Menu from "./Menu.jsx";
import Summary from "./Summary.jsx";


const Layout = (props) => {
    return (

        <div className="container h-screen overflow-hidden w-full  mb-3 mx-auto grid grid-cols-4">
            <div className="col-span-1 h-full    overflow-y-auto overflow-x-hidden ">
                <Menu />
            </div>
            <div className=" col-span-2 h-full scroll-bar-hidden  overflow-y-auto overflow-x-hidden border-x-2 border-gray-100 ">
                {
                    props.children
                }
            </div>
            <div className="col-span-1 h-full scroll-bar-hidden  overflow-y-auto overflow-x-hidden ">
                <Summary />
            </div>
        </div>
    );
};

export default Layout;