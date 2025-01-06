<<<<<<< HEAD
import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AuthorPage from "./pages/authorPage.jsx";
=======
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";
>>>>>>> 97d1e26d56acc4b0246afc157f970df41b1b5b3b

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "*", element: "Not Found" },
]);

const App = () => {
<<<<<<< HEAD
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"  element={<HomePage />} />
                <Route path="/login"  element={<AuthorPage />} />
            </Routes>
        </BrowserRouter>
    );
=======
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
>>>>>>> 97d1e26d56acc4b0246afc157f970df41b1b5b3b
};

export default App;
