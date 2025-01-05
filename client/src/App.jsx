import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "*", element: "Not Found" },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
