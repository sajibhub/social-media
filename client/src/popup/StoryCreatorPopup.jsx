import { useState } from "react";
import uiManage from "@/store/uiManage.js";
import StoryStore from "@/store/StoryStore.js";
import toast from "react-hot-toast";

export default function StoryCreatorPopup() {
    const {createStory , setCreateStory} = uiManage()
    const {createStoryReq} = StoryStore()
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImageFile(file);
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const createStoryHandler = async () => {
        setLoading(true);
        const response = await createStoryReq(imageFile, text );
        setLoading(false);
        if (response === 201) {
            toast.success("Post Created Successfully!");
            setCreateStory(false);
            setText(null)
            setImage(null);
        }
        else {
            toast.error(response.message);
        }

    }


    return (
        <div className={`fixed inset-0 flex items-center justify-center ${createStory ? "block" : "hidden"} bg-black bg-opacity-50 z-[9999999]`}>
            <div className="bg-white w-96 p-6 rounded-lg shadow-lg  relative">
                <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-bold">Create a Story</h2>
                    <button onClick={() => setCreateStory(false)}
                            className="text-gray-600 ">close
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {image && (
                        <img src={image} alt="Uploaded" className="w-full h-40 object-cover rounded-lg" />
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="border p-2 rounded-lg" />
                    <textarea
                        placeholder="Write something..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="border p-2 rounded-lg h-24"
                    />
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-5"
                            onClick={createStoryHandler}
                    >
                        Post Story {
                        loading && <div className="loader"></div>
                    }
                    </button>
                </div>

            </div>
        </div>
    );
}
