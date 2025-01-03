import Menu from "./Menu.jsx";
import Summary from "./Summary.jsx";


const Layout = (props) => {
    return (
        <div className="container mx-auto grid grid-cols-4">
            <div className="col-span-1 h-screen overflow-y-auto overflow-x-hidden ">
                <Menu />
            </div>
            <div className="col-span-2 h-screen border-x-2 border-gray-100 ">
                {
                    props.children
                }
            </div>
            <div className="col-span-1 h-screen overflow-y-auto overflow-x-hidden ">
                <Summary />
            </div>
        </div>
    );
};

export default Layout;