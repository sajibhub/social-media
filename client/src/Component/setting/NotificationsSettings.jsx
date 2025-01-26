import { useState } from "react";

const NotificationsSettings = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [postTags, setPostTags] = useState(true);
    const [birthdays, setBirthdays] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        setIsEditing(false);
        alert("Notification settings saved successfully!");
    };

    return (
        <div className="p-6 pt-0">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl border p-8">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Notifications Settings
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
                        {/* Email Notifications */}
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="emailNotifications"
                                className="text-sm font-medium text-gray-700"
                            >
                                Receive Email Notifications:
                            </label>
                            <input
                                type="checkbox"
                                id="emailNotifications"
                                checked={emailNotifications}
                                onChange={() => setEmailNotifications(!emailNotifications)}
                                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                            />
                        </div>

                        {/* SMS Notifications */}
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="smsNotifications"
                                className="text-sm font-medium text-gray-700"
                            >
                                Receive SMS Notifications:
                            </label>
                            <input
                                type="checkbox"
                                id="smsNotifications"
                                checked={smsNotifications}
                                onChange={() => setSmsNotifications(!smsNotifications)}
                                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                            />
                        </div>

                        {/* Push Notifications */}
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="pushNotifications"
                                className="text-sm font-medium text-gray-700"
                            >
                                Enable Push Notifications:
                            </label>
                            <input
                                type="checkbox"
                                id="pushNotifications"
                                checked={pushNotifications}
                                onChange={() => setPushNotifications(!pushNotifications)}
                                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                            />
                        </div>

                        {/* Notifications for Posts and Tags */}
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="postTags"
                                className="text-sm font-medium text-gray-700"
                            >
                                Notify me about Posts & Tags:
                            </label>
                            <input
                                type="checkbox"
                                id="postTags"
                                checked={postTags}
                                onChange={() => setPostTags(!postTags)}
                                className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                            />
                        </div>

                        {/* Notifications for Birthdays */}
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="birthdays"
                                className="text-sm font-medium text-gray-700"
                            >
                                Notify me about Birthdays:
                            </label>
                            <input
                                type="checkbox"
                                id="birthdays"
                                checked={birthdays}
                                onChange={() => setBirthdays(!birthdays)}
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
                        {/* Email Notifications */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Email Notifications:</span>{" "}
                                {emailNotifications ? "Enabled" : "Disabled"}
                            </p>
                        </div>

                        {/* SMS Notifications */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">SMS Notifications:</span>{" "}
                                {smsNotifications ? "Enabled" : "Disabled"}
                            </p>
                        </div>

                        {/* Push Notifications */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Push Notifications:</span>{" "}
                                {pushNotifications ? "Enabled" : "Disabled"}
                            </p>
                        </div>

                        {/* Notifications for Posts and Tags */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Posts & Tags Notifications:</span>{" "}
                                {postTags ? "Enabled" : "Disabled"}
                            </p>
                        </div>

                        {/* Notifications for Birthdays */}
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Birthdays Notifications:</span>{" "}
                                {birthdays ? "Enabled" : "Disabled"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsSettings;
