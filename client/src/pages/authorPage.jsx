import SignIn from "../Component/author/SignIn.jsx";
import uiManage from "../store/uiManage.js";
import SignUp from "../Component/author/SignUp.jsx";
import {useEffect} from "react";

import {useNavigate} from "react-router-dom";
import authorStore from "@/store/authorStore.js";

const AuthorPage = () => {
    const navigate = useNavigate();
    const {author, setAuthor} = uiManage()
    const {readProfileReq} = authorStore()

    useEffect(() => {

        (

            async ()=>{
                let res = await readProfileReq("me")
                if(res){
                    navigate('/')
                }
            }
        )()

    }, []);


    return (
        <>
            <div className="grid grid-cols-3 grid-rows-none overflow-y-auto  h-screen">

                <div
                    className="
                    relative col-span-3 lg:col-span-1 h-full  flex flex-col justify-center items-center
                    "
                >
                    <img
                        className="
                        min-h-full min-w-full
                        "
                        src="/image/login_photo.jpg" alt="photo"
                    />
                    <div className="h-full w-full absolute top-0 left-0 bg-sky-50 bg-opacity-10"></div>

                    <div className="absolute bottom-0 lg:bottom-auto lg:right-0 w-full lg:w-[130px] flex flex-row lg:flex-col ">
                        <button onClick={()=>setAuthor("signIn")} className={author==="signIn"? "author-tab-active" :"author-tab" }>Sign In</button>
                        <button onClick={()=>setAuthor("signUp")} className={author==="signUp"? "author-tab-active" :"author-tab" }>Sign Up</button>
                    </div>
                </div>

                <div className="col-span-3 lg:col-span-2 w-full h-full relative ">
                    {
                        author === "signIn" &&  <SignIn />
                    }
                    {
                        author === "signUp" &&  <SignUp />
                    }
                </div>
            </div>
        </>
    );
};

export default AuthorPage;