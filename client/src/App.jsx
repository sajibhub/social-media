import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";


const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"  element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;