import authorStore from "@/store/authorStore.js";


const ImageGallery = () => {
    const {imageGallery} = authorStore()

    if (imageGallery === null)  {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {
                        Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse bg-gray-200 h-60 w-full rounded-lg"
                            ></div>
                        ))
                    }
                </div>
            </div>
        );
    }

    else {
        return (
            <div className=" p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {imageGallery?.map((img, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-lg cursor-pointer border">
                            <img
                                src={img}
                                alt={`Gallery Image ${index + 1}`}
                                className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
};

export default ImageGallery;
