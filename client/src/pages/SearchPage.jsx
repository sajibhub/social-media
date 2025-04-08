import Layout from "@/layout/Layout.jsx";
import { IoSearch } from "react-icons/io5";
import SearchResultComponent from "@/Component/users/SearchResultComponent.jsx";
import authorStore from "@/store/authorStore.js";
import { useState } from "react";

const SearchPage = () => {
  const { searchUserReq} = authorStore();
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    try {
      setLoading(true);
      await searchUserReq(search)
    } catch (error) {
      setLoading(false)
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
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type here" // Fixed typo
          className="py-4 ps-4 w-full text-lg flex-grow outline-none bg-transparent"
          disabled={loading} 
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