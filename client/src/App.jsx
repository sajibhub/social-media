
import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AuthorPage from "./pages/authorPage.jsx";
import EmojiFileUploader from "@/Component/utility/try.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";

const App = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"  element={<HomePage />} />
                <Route path="/author"  element={<AuthorPage />} />
                <Route path="/profile"  element={<ProfilePage />} />


                <Route path="/try"  element={<EmojiFileUploader />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
