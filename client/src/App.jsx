import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage.jsx";
import AuthorPage from "@/pages/authorPage.jsx";
import EmojiFileUploader from "@/Component/utility/try.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import SavePostPage from "@/pages/SavePostPage.jsx";
import SearchPage from "@/pages/SearchPage.jsx";
import Layout from "./layout/Layout.jsx";
import Notification from "./pages/notifications.jsx";
import EmojiFileUploader from "@/Component/utility/try.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/author" element={<AuthorPage />} />
        <Route path="/profile/:user" element={<ProfilePage />} />
        <Route path="/save-post" element={<SavePostPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/notification"
          element={
            <Layout>
              <Notification />
            </Layout>
          }
        />

        <Route path="/try" element={<EmojiFileUploader />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
