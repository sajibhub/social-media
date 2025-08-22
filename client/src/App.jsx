import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import 'animate.css';
import HomePage from "./pages/HomePage.jsx";
import AuthorPage from "./pages/authorPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SavePostPage from "./pages/SavePostPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import Layout from "./layout/Layout.jsx";
import NotificationList from "./pages/NotificationList.jsx";
import NotFound from "./Component/NotFound/NotFound";
import SinglePostPreview from "./pages/SinglePostPreview";
import AddPostPopup from "./pages/AddPostPage.jsx";
import SettingPage from "./pages/SettingPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";
import { socket } from './utils/socket.js';
import authorStore from "./store/authorStore.js";
import NotificationSound from '../public/audio/notification.wav';
import notificationStore from "./store/notificationStore.js";
import Message from "./pages/message.jsx";
import useActiveStore from './store/useActiveStore.js';
import { create } from "zustand";   

// ✅ Proper zustand store
const useThemeStore = create((set) => ({
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (darkMode) => set({ darkMode }),
}));

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/author", element: <AuthorPage /> },
  { path: "/profile/:user", element: <ProfilePage /> },
  { path: "/save-post", element: <SavePostPage /> },
  { path: "/search", element: <SearchPage /> },
  {
    path: "/notification",
    element: (
      <Layout>
        <NotificationList />
      </Layout>
    ),
  },
  { path: "/conversation", element: <Message /> },
  { path: "/message/:conversationId", element: <Message /> },
  {
    path: "/post/:postId",
    element: (
      <Layout>
        <SinglePostPreview />
      </Layout>
    ),
  },
  {
    path: "/add-post",
    element: (
      <Layout>
        <AddPostPopup />
      </Layout>
    ),
  },
  { path: "/setting", element: <SettingPage /> },
  { path: "/story/:id", element: <StoryPage /> },
  { path: "*", element: <NotFound /> },
]);



const App = () => {
  const { profileData, updateProfileDataField } = authorStore();
  const { addNotification } = notificationStore();
  const { setActiveUsers } = useActiveStore();
  const [notification, setNotification] = useState(profileData?.notification || 0);
  const audio = new Audio(NotificationSound);
  const darkMode = useThemeStore((state) => state.darkMode);

  // ✅ Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      useThemeStore.setState({ darkMode: savedTheme === "dark" });
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      useThemeStore.setState({ darkMode: prefersDark });
    }
  }, []);

  // ✅ Apply theme class
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ✅ Socket
  useEffect(() => {
    if (socket.disconnected) socket.connect();

    const handleNotification = (data) => {
      toast.success(`New ${data?.type} Notification`);
      audio.play().catch((err) => console.error("Audio play failed:", err));
      addNotification(data);
      setNotification((prev) => {
        const newCount = prev + 1;
        updateProfileDataField("notification", newCount);
        return newCount;
      });
    };

    socket.on("notification", handleNotification);
    socket.on("active", (users) => setActiveUsers(users));

    return () => {
      socket.off("notification", handleNotification);
      socket.off("active");
    };
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: darkMode ? "#374151" : "#ffffff",
            color: darkMode ? "#ffffff" : "#1f2937",
            border: darkMode
              ? "1px solid #4b5563"
              : "1px solid #e5e7eb",
          },
        }}
      />
    </div>
  );
};

export default App;
