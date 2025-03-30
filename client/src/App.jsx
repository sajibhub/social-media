import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import 'animate.css';
import HomePage from "@/pages/HomePage.jsx";
import AuthorPage from "@/pages/authorPage.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import SavePostPage from "@/pages/SavePostPage.jsx";
import SearchPage from "@/pages/SearchPage.jsx";
import Layout from "@/layout/Layout.jsx";
import NotificationList from "@/pages/NotificationList.jsx";
import toast, { Toaster } from "react-hot-toast";
import NotFound from "./Component/NotFound/NotFound";
import SinglePostPreview from "@/pages/SinglePostPreview";
import AddPostPopup from "@/pages/AddPostPage.jsx";
import SettingPage from "@/pages/SettingPage.jsx";
import StoryPage from "@/pages/StoryPage.jsx";
import { socket } from './utils/socket.js';
import authorStore from "./store/authorStore.js";
import NotificationSound from '../public/audio/notification.wav'
import notificationStore from "./store/notificationStore.js";
import Message from "./pages/message.jsx"
import useActiveStore from './store/useActiveStore.js'


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
    path: "/conversation",
    element: < Message />
  },
  {
    path: "/message/:conversationId",
    element: <Message />
  },
  {
    path: "/post/:postId",
    element: <Layout>
      <SinglePostPreview />
    </Layout>
  },
  {
    path: "/add-post",
    element: <Layout>
      <AddPostPopup />
    </Layout>
  },
  {
    path: "/setting",
    element: <SettingPage />
  },
  {
    path: "/story/:id",
    element: <StoryPage />
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);


const App = () => {
  // console.log = () => { };
  const { profileData } = authorStore();
  const { addNotification } = notificationStore();
  const { setActiveUsers, isUserOnline } = useActiveStore()
  const [notification, setNotification] = useState(profileData?.notification || 0);
  const updateProfileDataField = authorStore((state) => state.updateProfileDataField);
  // Initialize audio with try-catch
  const audio = new Audio(NotificationSound);

  useEffect(() => {
    const userId = localStorage.getItem("id");
  
    // Only connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }
  
    // Join with userId if it exists and socket is connected
    if (userId && socket.connected) {
      socket.emit("join", userId);
    }
  
    const handleNotification = (data) => {
      toast.success(`New ${data?.type} Notification`);
      audio.play().catch((err) => console.error("Audio play failed:", err)); // Handle play errors
      addNotification(data);
      setNotification((prev) => {
        const newNotificationCount = prev + 1;
        updateProfileDataField("notification", newNotificationCount);
        return newNotificationCount;
      });
    };
  
    socket.on("notification", handleNotification);
    socket.on('active', (users) => setActiveUsers(users));
  
    return () => {
      socket.off("notification", handleNotification);
      socket.off('active');
    };
  }, []);
  

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  );
};
export default App;
