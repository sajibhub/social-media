import { useState } from "react";
import { FaFacebook,  FaLinkedin } from "react-icons/fa";
import { TbBrandFiverr } from "react-icons/tb";
import { FaGitAlt } from "react-icons/fa";
import authorStore from "../../store/authorStore";



const SocialMediaComponent = () => {

  const {myProfileData} = authorStore()

  const [isEditing, setIsEditing] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setLinks((prevLinks) => ({ ...prevLinks, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="p-5 " >
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center mt-5 ">
        Social Media Links
      </h2>

      {/* Social Media Links */}
      <div className="flex gap-6 justify-center mb-6">
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-3xl hover:text-blue-800"
        >
          <FaFacebook />
        </a>

        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 text-3xl hover:text-blue-900"
        >
          <FaLinkedin />
        </a>

        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 text-3xl hover:text-blue-600"
        >
          <TbBrandFiverr />
        </a>
        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 text-3xl hover:text-pink-700"
        >
          <FaGitAlt />
        </a>
        
      </div>

      {/* Edit Links */}
      {isEditing && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Facebook URL:
            </label>
            <input
              type="text"
              name="facebook"
              value={myProfileData.mediaLink["facebook"]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Linkedin URL:
            </label>
            <input
              type="text"
              name="linkedin"
              value={myProfileData.mediaLink["linkedin"]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              fiver URL:
            </label>
            <input
              type="text"
              name="fiver"
              value={myProfileData.mediaLink["fiver"]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              GitHub URL:
            </label>
            <input
              type="text"
              name="github"
              value={myProfileData.mediaLink["github"]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700"
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        {isEditing ? (
          <>
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleEditToggle}
            className="px-4 py-2  text-blue-500 rounded-md font-medium text-lg"
          >
            Edit Links
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialMediaComponent;
