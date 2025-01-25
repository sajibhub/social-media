import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "@/pages/HomePage.jsx";
import AuthorPage from "@/pages/authorPage.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import SavePostPage from "@/pages/SavePostPage.jsx";
import SearchPage from "@/pages/SearchPage.jsx";
import Layout from "@/layout/Layout.jsx";
import NotificationList from "@/pages/NotificationList.jsx";
import { Toaster } from "react-hot-toast";
import NotFound from "./Component/NotFound/NotFound";
import SinglePostPreview from "@/pages/SinglePostPreview"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/author",
    element: <AuthorPage />,
  },
  {
    path: "/profile/:user",
    element: <ProfilePage />,
  },
  {
    path: "/save-post",
    element: <SavePostPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/notification",
    element: (
      <Layout>
        <NotificationList />
      </Layout>
    ),
  },
  {
    path: "/post/:postId",
    element: <Layout>
      <SinglePostPreview />
    </Layout>
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />

      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  );
};

export default App;
