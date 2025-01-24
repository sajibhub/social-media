import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaImages } from "react-icons/fa";
import { MdEmojiEmotions } from "react-icons/md";
import { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import postStore from "@/store/postStore.js";
import LoadingButtonFit from "@/Component/button/LoadingButtonFit.jsx";
import { RiEdit2Fill } from "react-icons/ri";
import { AiFillDelete } from "react-icons/ai";
import { useParams } from "react-router-dom";
import authorStore from "@/store/authorStore.js";
import VerifiedBadge from "../Component/VerifyBadge/VerifyBadge";

const CommentPopup = () => {
  const { user } = useParams();
  const path = window.location.pathname;
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const {
    setCommentPostData,
    commentPostData,
    clearCommentPostData,
    commentPostReq,
    myPostReq,
    commentListReq,
    commentList,
    newsFeedReq,
    deletePostCommentReq,
    updateComment,
  } = postStore();
  const { myProfileData } = authorStore();
  const id = commentPostData.id;

  const [loader, setLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState({
    status: false,
    id: null,
  });

  useEffect(() => {
    (async () => {
      await commentListReq(id);
    })();
  }, []);

  const handleEmojiClick = (emojiData) => {
    if (commentPostData.comment === undefined) {
      commentPostData.comment = "";
    }
    let newCommentPostData = commentPostData.comment + emojiData.emoji;
    setCommentPostData("comment", newCommentPostData);
    setShowPicker(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitComment = async () => {
    setLoader(true);

    if (commentPostData.commentId === undefined) {
      let res = await commentPostReq(commentPostData);
      if (res) {
        if (path === "/") {
          await newsFeedReq();
        } else {
          if (user !== "me") {
            await myPostReq(user);
          } else {
            await myPostReq(myProfileData.username);
          }
        }
        clearCommentPostData(null);
        toast.success("Comment Create Successfully");
      } else {
        toast.error("Comment Create Failed");
      }
    } else {
      let res = await updateComment(commentPostData);
      if (res) {
        if (path === "/") {
          await newsFeedReq();
        } else {
          if (user !== "me") {
            await myPostReq(user);
          } else {
            await myPostReq(myProfileData.username);
          }
        }
        clearCommentPostData(null);
        toast.success("Comment Update Successfully");
      } else {
        toast.error("Comment Update Failed");
      }
    }

    setLoader(false);
  };

  const deleteComment = async (id) => {
    setDeleteLoader({
      status: true,
      id: id,
    });

    const postId = commentPostData.id;
    let res = await deletePostCommentReq(postId, id);
    setDeleteLoader({
      status: false,
      id: null,
    });
    if (res) {
      toast.success("Comment Delete Successfully");
      await commentListReq(postId);
    } else {
      toast.error("Comment Delete Failed");
    }
  };

  const editComment = (id, data) => {
    setCommentPostData("comment", data);
    setCommentPostData("commentId", id);
  };

  return (
    <div
      className="h-screen w-screen absolute top-0 right-0 bg- z-[9999999] bg-white bg-opacity-60
            mx-auto flex justify-center items-center overflow-hidden
            "
    >
      <div
        className="
            max-w-[600px] h-[80%] w-full bg-white shadow-lg
            border rounded mx-3 md:px-0 relative overflow-hidden scroll-bar-hidden
            "
      >
        <div
          className="flex flex-row justify-between items-center pb-3 border-b-2 border-gray-100
                    sticky w-full left-0 z-30 top-0 bg-white bg-blur bg-opacity-70 p-5
                    "
        >
          <h2 className="text-lg text-neutral-700 font-semibold">
            Add Comment
          </h2>
          <IoClose
            onClick={() => clearCommentPostData(null)}
            className="text-2xl font-semibold text-neutral-800 cursor-pointer"
          />
        </div>

        <div className="scroll-bar-hidden  overflow-y-auto h-full pb-64">
          {commentList === null &&
            [1, 1, 1, 1].map((item, index) => {
              return (
                <div
                  key={index}
                  className="pt-3 pb-1 ps-2 pe-1 border-b mx-4 animate-pulse"
                >
                  <div className="flex flex-row gap-3 justify-start items-start">
                    {/* Profile Image Skeleton */}
                    <div className="flex-shrink-0 h-[35px] w-[35px] rounded-full bg-gray-300"></div>

                    {/* Name and Username Skeleton */}
                    <div className="flex-grow">
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>

                  {/* Comment Text Skeleton */}
                  <div className="mt-2 flex flex-wrap items-end">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex justify-end items-center gap-3 my-1 w-full mt-2">
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          {commentList !== null &&
            commentList.map((item, index) => {
              return (
                <div key={index} className=" pt-3 pb-1 ps-2 pe-1 border-b mx-4">
                  <div className="flex flex-row gap-3 justify-start items-start">
                    <div className=" flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden flex  justify-center items-center">
                      <img
                        src={item.user.profile}
                        alt="profile image"
                        className="min-w-full min-h-full "
                      />
                    </div>
                    <div className=" flex-grow">
                      <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-1">
                        <Link
                          to={`/profile/${item.user.username}`}
                          className="hover:underline"
                        >
                          {item.user.fullName}
                        </Link>
                        {item.user.verify && (
                          <VerifiedBadge isVerified={item.user.verify} />
                        )}
                      </h2>
                      <h2 className="text-base font-normal text-neutral-700 ">
                        {item.user.username}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-end">
                    <p className="text-sm text-neutral-600 flex-grow ">
                      {item.comment}
                    </p>

                    {item.isComment && (
                      <div className="flex justify-end items-center gap-3 my-1">
                        <button
                          onClick={() => editComment(item._id, item.comment)}
                        >
                          <RiEdit2Fill className="text-lg font-semibold" />
                        </button>
                        <button onClick={() => deleteComment(item._id)}>
                          {deleteLoader.status &&
                          deleteLoader.id === item._id ? (
                            <div className="loader-dark"></div>
                          ) : (
                            <AiFillDelete className="text-lg font-semibold" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {showPicker && (
          <div className=" absolute top-0 right-0 z-30">
            <EmojiPicker className="ms-auto" onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div
          className=" px-5 py-3 absolute bottom-0 left-0
                    bg-white bg-opacity-80 bg-blur shadow w-full
                    "
        >
          <div className="flex flex-row gap-3 justify-center items-start pb-2 border-b-2 border-gray-100">
            <div
              className="
                            flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden
                            flex flex-row justify-center items-center"
            >
              <img
                src={myProfileData.profile}
                alt="profile image"
                className="min-w-full min-h-full "
              />
            </div>

            <textarea
              rows={2}
              value={commentPostData.comment}
              onChange={(e) => setCommentPostData("comment", e.target.value)}
              className="text-base text-neutral-800 flex-grow  bg-transparent w-full"
              placeholder="Type Comment"
            />
          </div>

          {image && (
            <div className="w-full h-[250px] flex justify-center items-center overflow-hidden relative">
              <button
                onClick={() => setImage(null)}
                className="
                                h-[35px] w-[35px] bg-white rounded-full  cursor-pointer absolute top-3 right-3
                                justify-center items-center hover:shadow
                                "
              >
                <IoClose
                  className="
                                    mx-auto
                                text-2xl font-semibold text-neutral-800
                                "
                />
              </button>
              <img
                src={image}
                alt="Uploaded Device"
                className="min-w-full min-h-full "
              />
            </div>
          )}

          <div className="flex flex-row justify-between gap-3 items-center pt-3">
            <div className=" flex flex-row justify-start gap-3 items-center">
              <div className="flex flex-row items-center overflow-hidden w-fit">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: "absolute",
                    width: "20px",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                <FaImages className="text-xl text-neutral-700 cursor-pointer " />
              </div>
              <MdEmojiEmotions
                onClick={() => setShowPicker((prev) => !prev)}
                className="text-xl text-neutral-700 cursor-pointer "
              />
            </div>

            {loader ? (
              <LoadingButtonFit text="Loading..." />
            ) : (
              <button
                onClick={submitComment}
                className="
                            px-3 py-1 rounded-full border border-sky-500 text-sky-500
                            hover:bg-sky-500 hover:text-sky-50
                            "
              >
                {commentPostData.commentId !== undefined
                  ? " Update"
                  : " Comment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;
