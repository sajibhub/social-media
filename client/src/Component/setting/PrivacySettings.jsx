import { useState } from "react";

const PrivacySettings = () => {
    const [postVisibility, setPostVisibility] = useState("Public");
    const [profileVisibility, setProfileVisibility] = useState("Friends");
    const [allowSearch, setAllowSearch] = useState(true);

    const [isEditing, setIsEditing] = useState(false);

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        setIsEditing(false);
        alert("Settings Saved");
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg border w-full max-w-3xl p-8">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Privacy Settings
                </h1>

                {/* Toggle Edit/Preview Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={toggleEditMode}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                            isEditing
                                ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                : "bg-sky-500 text-white hover:bg-sky-600"
                        } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                    >
                        {isEditing ? "Preview" : "Edit"}
                    </button>
                </div>

                {isEditing ? (
                    /* Edit View */
                    <form className="space-y-6">
                        {/* Who Can See Your Posts */}
                        <div>
                            <label
                                htmlFor="postVisibility"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Who Can See Your Posts:
                            </label>
                            <select
                                id="postVisibility"
                                value={postVisibility}
                                onChange={(e) => setPostVisibility(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="Public">Public</option>
                                <option value="Friends">Friends</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>

                        {/* Profile Visibility */}
                        <div>
                            <label
                                htmlFor="profileVisibility"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Profile Visibility:
                            </label>
                            <select
                                id="profileVisibility"
                                value={profileVisibility}
                                onChange={(e) => setProfileVisibility(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="Friends">Friends</option>
                                <option value="Only Me">Only Me</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>

                        {/* Search Settings */}
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="allowSearch"
                                className="text-sm font-medium text-gray-700"
                            >
                                Allow search engines to find my profile:
                            </label>
                            <input
                                type="checkbox"
                                id="allowSearch"
                                checked={allowSearch}
                                onChange={() => setAllowSearch(!allowSearch)}
                                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="text-center">
                            <button
                                onClick={handleSave}
                                type="button"
                                className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Preview View */
                    <div className="space-y-6">
                        {/* Who Can See Your Posts */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Who Can See Your Posts:</span>{" "}
                                {postVisibility}
                            </p>
                        </div>

                        {/* Profile Visibility */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Profile Visibility:</span>{" "}
                                {profileVisibility}
                            </p>
                        </div>

                        {/* Search Settings */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Search Engines Allowed:</span>{" "}
                                {allowSearch ? "Yes" : "No"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivacySettings;
