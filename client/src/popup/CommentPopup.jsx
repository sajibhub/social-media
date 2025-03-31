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
import VerifiedBadge from "../Component/utility/VerifyBadge.jsx";
import useActiveStore from "../store/useActiveStore.js";

const CommentPopup = () => {
  const { user } = useParams();
  const path = window.location.pathname;
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const { isUserOnline } = useActiveStore()

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
                <div
                  key={index}
                  className="py-4 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Profile Image and Status */}
                    <div className="relative flex-shrink-0">
                      <Link to={`/profile/${item.user.username}`}>
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img
                            src={item.user.profile}
                            alt={`${item.user.fullName} profile`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${isUserOnline(item.user._id)
                            ? "bg-green-500 border-white"
                            : "bg-red-500 border-white"
                          }`}
                      ></div>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${item.user.username}`}
                          className="text-sm font-semibold text-neutral-800 hover:underline"
                        >
                          {item.user.fullName}
                        </Link>
                        {item.user.verify && <VerifiedBadge isVerified={item.user.verify} />}
                        <span className="text-xs text-gray-500">@{item.user.username}</span>
                      </div>
                      <p className="text-sm text-neutral-700 mt-1 break-words">{item.comment}</p>

                      {/* Actions (Edit/Delete) */}
                      {item.isComment && (
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => editComment(item._id, item.comment)}
                            className="text-neutral-600 hover:text-sky-500 transition-colors"
                            title="Edit comment"
                          >
                            <RiEdit2Fill className="text-base" />
                          </button>
                          <button
                            onClick={() => deleteComment(item._id)}
                            className="text-neutral-600 hover:text-red-500 transition-colors"
                            title="Delete comment"
                          >
                            {deleteLoader.status && deleteLoader.id === item._id ? (
                              <div className="loader-dark w-4 h-4"></div>
                            ) : (
                              <AiFillDelete className="text-base" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {showPicker && (
          <div onMouseLeave={() => setShowPicker(false)}
            className=" absolute top-0 right-0 z-30">
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
