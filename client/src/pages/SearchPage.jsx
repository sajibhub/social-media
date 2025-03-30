import Layout from "@/layout/Layout.jsx";
import { IoSearch } from "react-icons/io5";
import SearchResultComponent from "@/Component/users/SearchResultComponent.jsx";
import authorStore from "@/store/authorStore.js";
import { useState } from "react";

const SearchPage = () => {
  const { searchUserReq, searchKeywords, setSearchKeywords } = authorStore();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchKeywords.trim()) return; 
    
    try {
      setLoading(true);
      await searchUserReq(searchKeywords);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <form
        onSubmit={handleSearch}
        className="w-full border-b-2 sticky top-0 bg-white bg-opacity-20 backdrop-blur-md z-[999999] flex items-center"
      >
        <input
          value={searchKeywords} // Controlled input
          onChange={(e) => setSearchKeywords(e.target.value)}
          placeholder="Type here" // Fixed typo
          className="py-4 ps-4 w-full text-lg flex-grow outline-none bg-transparent"
          disabled={loading} // Disable input while loading
        />
        <div className="me-5">
          {loading ? (
            <div className="loader-dark w-5 h-5 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
          ) : (
            <button type="submit" disabled={loading}>
              <IoSearch className="text-xl font-medium hover:text-sky-500 transition-colors" />
            </button>
          )}
        </div>
      </form>
      <SearchResultComponent />
    </Layout>
  );
};

export default SearchPage;