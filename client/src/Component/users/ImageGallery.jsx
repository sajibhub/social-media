import authorStore from "@/store/authorStore.js";
import {useEffect} from "react";
import {useParams} from "react-router-dom";

const ImageGallery = () => {
    const {user} = useParams();
  const { imageGallery ,clear_imageGallery ,imageGalleryReq } = authorStore();

  useEffect(() => {
      (
          async () => {
              clear_imageGallery()
              await imageGalleryReq(user)
          }
      )()
  },[user])

  if (imageGallery === null) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-300 h-60 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
            ></div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className=" px-4  lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4">
          {imageGallery?.map((img, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg shadow-xl cursor-pointer border border-gray-200 hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
            >
              <img
                src={img}
                alt={`Gallery Image ${index + 1}`}
                className="w-full h-60 object-cover rounded-lg transition-transform duration-300"
              />
            </div>
          ))}
        </div>

          <div className="py-[46px] lg:py-0"></div>
      </div>
    );
  }
};

export default ImageGallery;
