import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import authorStore from "../../store/authorStore.js";
import { useParams } from "react-router-dom";

const ImageGallery = () => {
  const { user } = useParams();
  const { imageGallery, clear_imageGallery, imageGalleryReq } = authorStore();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      clear_imageGallery();
      await imageGalleryReq(user);
    })();
  }, [user]);

  // Skeleton loading component
  const Skeleton = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`animate-pulse rounded-lg shadow-md transform transition-all duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            } h-60`}
          ></div>
        ))}
      </div>
    </div>
  );

  if (imageGallery === null) {
    return <Skeleton />;
  }

  // Empty state component
  const EmptyState = () => (
    <div className={`flex flex-col items-center justify-center py-16 rounded-lg ${
      darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
    }`}>
      <div className={`text-5xl mb-4 ${
        darkMode ? 'text-gray-600' : 'text-gray-300'
      }`}>🖼️</div>
      <h3 className={`text-xl font-medium mb-2 ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>No images found</h3>
      <p className={`text-center max-w-md ${
        darkMode ? 'text-gray-500' : 'text-gray-500'
      }`}>
        This user hasn't uploaded any images yet.
      </p>
    </div>
  );

  return (
    <div className={`px-4 lg:p-6 ${darkMode ? 'bg-gray-900' : ''}`}>
      {imageGallery.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4"
        >
          {imageGallery.map((img, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } border hover:shadow-2xl hover:scale-105`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-lg"
              >
                <img
                  src={img}
                  alt={`Gallery Image ${index + 1}`}
                  className="w-full h-60 object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  darkMode ? 'from-gray-900/70' : 'from-black/50'
                } to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4`}>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-white'
                  }`}>
                    Image {index + 1}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
      <div className="py-[46px] lg:py-0"></div>
    </div>
  );
};

export default ImageGallery;