import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import 'animate.css';
import { create } from "zustand";

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
import Message from "./pages/message.jsx";

import { socket } from './utils/socket.js';
import NotificationSound from '../public/audio/notification.wav';

import { setActiveUsers, addActiveUser, removeActiveUser } from "./redux/features/users/activeUser.js";
import { addNotification } from "./redux/features/notification/notifications.js"; 

// ✅ Theme Zustand store
const useThemeStore = create((set) => ({
  darkMode: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (darkMode) => set({ darkMode }),
}));

// ✅ Routes
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
  const dispatch = useDispatch();
  const darkMode = useThemeStore((state) => state.darkMode);
  const { activeUsers } = useSelector((state) => state.activeUsers);

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
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // ✅ Socket.IO integration
  useEffect(() => {
    if (socket.disconnected) socket.connect();

    const handleNotification = (data) => {
      if (!data) return;
      toast.success(`New ${data.type} Notification`);

      const audio = new Audio(NotificationSound);
      audio.play().catch((err) => console.error("Audio play failed:", err));

      // ✅ Dispatch to Redux notifications
      dispatch(addNotification(data));
    };

    const handleOnlineUsers = (users) => dispatch(setActiveUsers(users));
    const handleOnline = ({ id }) => dispatch(addActiveUser(id));
    const handleOffline = ({ id }) => dispatch(removeActiveUser(id));

    // Ask server for the online user list
    socket.emit("onlineUsers");

    // Listen for socket events
    socket.on("notification", handleNotification);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("online", handleOnline);
    socket.on("offline", handleOffline);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("online", handleOnline);
      socket.off("offline", handleOffline);
    };
  }, [dispatch]);

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
            border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
          },
        }}
      />
    </div>
  );
};

export default App;
