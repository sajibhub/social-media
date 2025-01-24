import Layout from "@/layout/Layout.jsx";
import {IoSearch} from "react-icons/io5";
import SearchResultComponent from "@/Component/users/SearchResultComponent.jsx";
import authorStore from "@/store/authorStore.js";
import { useState} from "react";


const SearchPage = () => {
    const {searchUserReq, searchKeywords ,setSearchKeywords} = authorStore()

    const [loading, setLoading] = useState(false);

    const searchHandel = async (e)=>{
        e.preventDefault()

        setLoading(true);
        await searchUserReq(searchKeywords);
        setLoading(false);
    }


    return (
        <Layout>
            <>
                <form
                    onSubmit={searchHandel}
                    className="w-full  border-b-2 sticky top-0 bg-blur bg-white bg-opacity-20 z-[999999] flex items-center "
                >
                    <input
                        onChange={(e) => setSearchKeywords(e.target.value)}
                        placeholder="Type hare"
                        className="py-4 ps-4 w-full text-lg flex-grow"
                    />

                    {
                        loading ? <div className="loader-dark me-5"></div> : (
                            <button
                               type="submit"
                            >
                                <IoSearch className="text-xl me-5 font-medium hover:text-sky-500"/>
                            </button>
                        )
                    }
                </form>

            </>

            <SearchResultComponent/>


        </Layout>
    );
};

export default SearchPage;