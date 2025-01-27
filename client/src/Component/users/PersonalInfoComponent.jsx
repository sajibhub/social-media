import { useState } from "react";
import authorStore from "../../store/authorStore";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const PersonalInfoComponent = () => {
  const  {user}  = useParams();
  let myUser = localStorage.getItem("userName");

  const {
    myProfileData,
    profileData,
    updateProfileData,
    updateProfileReq,
    readProfileReq,
  } = authorStore();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);



  const handleProfileUpdate = async () => {
    setLoading(true);

    let reqData = ""

    if(myProfileData.username ===  profileData.username){
       reqData = {
        fullName: myProfileData.fullName,
        email: myProfileData.email,
        phoneNumber: myProfileData.phoneNumber,
        bio: myProfileData.bio,
         location: myProfileData.location,
         profession: myProfileData.profession,
      };

    }

    else {
       reqData = {
        username: myProfileData.username,
        fullName: myProfileData.fullName,
        email: myProfileData.email,
        phoneNumber: myProfileData.phoneNumber,
        bio: myProfileData.bio,
        location: myProfileData.location,
      };
    }

    const res = await updateProfileReq(reqData);
    setIsEditing(false);
    setLoading(false);
    if (res) {
      toast.success("Profile Updated Successfully");
      await readProfileReq("me");
    } else {
      toast.error("Profile Update Failed");
    }
  };

  if (profileData === null) {
    return (
      <div className="bg-gray-100 py-8 px-4">
        {/* Skeleton for Personal Info Form */}
        <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>

          <div className="space-y-6">
            {/* Skeleton for each field */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>

          {/* Skeleton for buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <div className="h-10 bg-gray-300 rounded w-24"></div>
            <div className="h-10 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className=" pb-3 ">
        {/* Personal Info Form */}
        <div className="bg-white border-b p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Personal Information
          </h2>
          <div className="space-y-6">
            {/* User Name */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">
                User Name:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={myProfileData.username}
                  onChange={(e) =>
                    updateProfileData("username", e.target.value)
                  }
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user
                    ? myProfileData?.username
                    : profileData?.username}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">
                Full Name:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={myProfileData.fullName}
                  onChange={(e) =>
                    updateProfileData("fullName", e.target.value)
                  }
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user
                    ? myProfileData?.fullName
                    : profileData?.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={myProfileData.email}
                  onChange={(e) => updateProfileData("email", e.target.value)}
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user ? myProfileData?.email : profileData?.email}
                </p>
              )}
            </div>

            {/* profession */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">Profession:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={myProfileData.profession}
                  onChange={(e) => updateProfileData("profession", e.target.value)}
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user ? myProfileData?.profession : profileData?.profession}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">Phone:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={myProfileData.phone}
                  onChange={(e) => updateProfileData("phone", e.target.value)}
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user ? myProfileData?.phone : profileData?.phone}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">Bio:</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={myProfileData.bio}
                  onChange={(e) => updateProfileData("bio", e.target.value)}
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                  rows="4"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user ? myProfileData?.bio : profileData?.bio}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium w-1/3">
                Address:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={myProfileData.location}
                  onChange={(e) =>
                    updateProfileData("location", e.target.value)
                  }
                  className="w-2/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              ) : (
                <p className="w-2/3 text-gray-600">
                  {myUser === user
                    ? myProfileData?.location
                    : profileData?.location}
                </p>
              )}
            </div>
          </div>

          {/* Edit/Save Buttons */}
          {myUser === user && (
            <div className="mt-8 flex justify-end gap-6">
              {isEditing ? (
                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition ease-in-out duration-300"
                >
                  {loading ? <div className="loader"></div> : "Save Changes"}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-base bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition ease-in-out duration-300"
                >
                  Edit Profile
                </button>
              )}
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition ease-in-out duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default PersonalInfoComponent;
