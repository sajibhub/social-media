import  { useState } from "react";
import authorStore from "../../store/authorStore";
import toast from "react-hot-toast";
import {useParams} from "react-router-dom";


const PersonalInfoComponent = () => {
  const {user} = useParams();

  const {myProfileData , profileData ,updateProfileData ,updateProfileReq,  readProfileReq} = authorStore()

  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);

  let myUser =  myProfileData.username




  const handleProfileUpdate = async () => {
    setLoading(true);
    const reqData = {
      username: myProfileData.username,
      fullName: myProfileData.fullName,
      email: myProfileData.email,
      phoneNumber: myProfileData.phoneNumber,
      bio: myProfileData.bio,
      currentAddress: myProfileData.currentAddress,
    }
    const res = await updateProfileReq(reqData);
    setIsEditing(false);
    setLoading(false);
    if(res){
      toast.success("Profile Updated Successfully");
      await readProfileReq("me")
    }
    else {
      toast.error("Profile Update Failed");
    }
  };

  if(profileData === null){
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
  }



  else {
    return (
        <div className=" bg-gray-100 py-8 px-4">

          {/* Personal Info Form */}
          <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              {/* user */}

              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-medium w-1/3">User Name:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={myProfileData.username}
                        onChange={
                          (e)=>updateProfileData("username" , e.target.value)
                        }
                        className="w-2/3 px-4 py-2 border rounded-md text-gray-700"
                    />
                ) : (
                    <p className="w-2/3 text-gray-600">
                      {
                        myUser === user?   myProfileData?.username : profileData?.username
                      }
                    </p>
                )}
              </div>

              {/* Name */}
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-medium w-1/3">Name:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={myProfileData.fullName}
                        onChange={
                          (e)=>updateProfileData("fullName" , e.target.value)
                        }
                        className="w-2/3 px-4 py-2 border rounded-md text-gray-700"
                    />
                ) : (
                    <p className="w-2/3 text-gray-600">
                      {
                        myUser === user?   myProfileData?.fullName : profileData?.fullName
                      }
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
                        onChange={
                          (e)=>updateProfileData("email" , e.target.value)
                        }
                        className="w-2/3 px-4 py-2 border rounded-md text-gray-700"
                    />
                ) : (
                    <p className="w-2/3 text-gray-600">
                      {
                        myUser === user?   myProfileData?.email : profileData?.email
                      }
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
                        onChange={
                          (e)=>updateProfileData("phone" , e.target.value)
                        }
                        className="w-2/3 px-4 py-2 border rounded-md text-gray-700"
                    />
                ) : (
                    <p className="w-2/3 text-gray-600">
                      {
                        myUser === user?   myProfileData?.phone : profileData?.phone
                      }
                    </p>
                )}
              </div>

              {/* bio */}
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-medium w-1/3">Bio:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="address"
                        value={myProfileData.bio}
                        onChange={
                          (e)=>updateProfileData("bio" , e.target.value)
                        }
                        className="w-2/3 px-4 py-2 border rounded-md text-gray-700"
                    />
                ) : (
                    <p className="w-2/3 text-gray-600">
                      {
                        myUser === user?   myProfileData?.bio : profileData?.bio
                      }
                    </p>
                )}
              </div>

              {/* address */}
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-medium w-1/3">Address:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="address"
                        value={myProfileData.currentAddress}
                        onChange={
                          (e)=>updateProfileData("currentAddress" , e.target.value)
                        }
                        className="w-2/3 px-4 py-2 border rounded-md text-gray-700"
                    />
                ) : (
                    <p className="w-2/3 text-gray-600">
                      {
                        myUser === user?   myProfileData?.currentAddress : profileData?.currentAddress
                      }
                    </p>
                )}
              </div>
            </div>

            {/* Edit/Save Buttons */}

            {
                myUser === user && (
                    <div className="mt-6 flex justify-end gap-4">
                      {isEditing ? (
                          <button
                              onClick={handleProfileUpdate}
                              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
                          >
                            {
                              loading ? <div className="loader"></div> : " Save"
                            }

                          </button>
                      ) : (
                          <button
                              onClick={
                                () => setIsEditing(true)
                              }
                              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
                          >
                            Edit
                          </button>
                      )}
                      {isEditing && (
                          <button
                              onClick={
                                () => setIsEditing(false)
                              }
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                      )}
                    </div>
                )
            }

          </div>
        </div>
    );
  }

};

export default PersonalInfoComponent;
