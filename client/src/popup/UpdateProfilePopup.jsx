import toast from "react-hot-toast";
import authorStore from "../store/authorStore";
import uiManage from "../store/uiManage";
import { useState } from "react";


const UpdateProfilePopup = () => {
  const {set_edit_profile_Ui_Control} = uiManage()
  const { setProfileUpdateData , profileUpdateData ,updateProfileRuq ,readProfileReq } =authorStore()

  const [loading, setLoading] = useState(false)

  const updateHandel = async()=>{

    const profile = profileUpdateData["profile"]
    const cover = profileUpdateData["cover"]

    setLoading(true)
    const res = await updateProfileRuq(cover,profile)
    setLoading(true)
    if(res){
      set_edit_profile_Ui_Control(null)
      toast.success("Updated profile successfully")
      await readProfileReq("me")
    }
    else{
      toast.error("Error updating profile")
    }

  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>

        <div className="flex flex-col gap-4">
          {/* Upload Cover Photo */}
          <div>
            <label
              htmlFor="uploadCover"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Cover Photo
            </label>
            <input
              onChange={
                (e)=> setProfileUpdateData("cover" , e.target.files[0] )
              }
              type="file"
              id="uploadCover"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Upload Profile Photo */}
          <div>
            <label
              htmlFor="uploadProfile"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Profile Photo
            </label>
            <input
               onChange={
                (e)=>{
                  setProfileUpdateData("profile" , e.target.files[0] )
                }
              }
              type="file"
              id="uploadProfile"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => set_edit_profile_Ui_Control(null)}
          >
            Cancel
          </button>

          {
            loading? <div className="loader-dark  my-2 mx-3"></div>  : (
              <button 
              onClick={ updateHandel }
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Save
              </button>
            )
          }
          

        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePopup;
