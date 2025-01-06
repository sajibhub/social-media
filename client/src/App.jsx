import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AuthorPage from "./pages/authorPage.jsx";


const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"  element={<HomePage />} />
                <Route path="/login"  element={<AuthorPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;