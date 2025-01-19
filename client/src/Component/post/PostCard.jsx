import { motion } from "framer-motion";
import {AiFillDelete, AiFillLike} from "react-icons/ai";
import { FaCommentDots, FaShare } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import postStore from "@/store/postStore.js";
import {RiEdit2Fill} from "react-icons/ri";
import toast from "react-hot-toast";
import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import authorStore from "@/store/authorStore.js";

const PostCard = () => {
  const {user} = useParams();
  const path = window.location.pathname;
  const navigate = useNavigate();
  const {my_post_data, setUpdatePostData,  deletePostReq, myPostReq ,likePostReq , setCommentPostData, removeCommentList, newsFeedReq} = postStore()
  const {myProfileData, profileData} = authorStore()
  const [loader, setLoader] = useState({
    status : false,
    id: ""
  });

  const goToProfile = (isPost , user)=>{
    if(isPost ){
      navigate("/profile/me")
    }
    else {
      navigate("/profile/"+user)
    }
  }

  if(my_post_data === null) {
    return <h1 className="h-full text-center text-3xl py-[100px]">Loading ..........</h1>
  }


  else {
    return (
        <>
          {my_post_data.map((items, i) => {
            return (
                <motion.div
                    key={i}
                    whileHover={{ opacity: 1, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
                    }}
                    className="max-w-[560px] pt-3 mt-3 rounded shadow-md mx-auto cursor-pointer"
                >
                  <div className="flex flex-row ms-3 me-5 gap-3 justify-start items-center">
                    <div className=" flex-shrink-0  h-[40px] w-[40px] rounded-full
                    overflow-hidden flex flex-row justify-center items-center shadow"
                    >

                      <img
                          onClick={()=>goToProfile(items.myPost, items.user.username)}
                          src={items.user.profile}
                          alt="profile image"
                          className="min-w-full min-h-full"
                      />

                    </div>
                    <div className="mb-2 flex-grow">
                      <h2
                          onClick={()=>goToProfile(items.myPost, items.user.username)}
                          className="text-base font-medium text-neutral-800"
                      >
                        {items.user?.fullName}
                        <span className="text-sm font-normal ms-2 text-sky-500 ">
                          {items.time}
                         </span>
                      </h2>
                      <p
                          onClick={()=>goToProfile(items.myPost, items.user.username)}
                          className="text-base text-neutral-600 "
                      >
                        {items.user?.username}
                      </p>
                    </div>

                    {
                      items.myPost ? (
                          <>
                            {
                              path !=="/" && (
                                    <>
                                      <button
                                          onClick={() => {
                                            setUpdatePostData("id", items._id);
                                            setUpdatePostData("caption", items.caption);
                                          }}
                                          className="text-sm font-medium text-neutral-800 hover:text-sky-500"
                                      >
                                        <RiEdit2Fill className="text-lg font-semibold"/>
                                      </button>
                                      <button
                                          onClick={async () => {
                                            let data = confirm("Are you sure you want to delete this post?");
                                            if (data) {
                                              let res = await deletePostReq(items._id);
                                              if (res) {
                                                toast.success("Deleting this post");
                                                if(path === "/"){
                                                  await newsFeedReq()
                                                }
                                                else {
                                                  if(user !== "me"){
                                                    await myPostReq(user);

                                                  }
                                                  else {
                                                    await myPostReq(myProfileData.username);
                                                  }
                                                }
                                              }
                                            }
                                          }}
                                          className="text-sm font-medium text-neutral-800 hover:text-sky-500"
                                      >
                                        <AiFillDelete className="text-lg font-semibold"/>
                                      </button>
                                    </>
                                )
                            }
                          </>
                      ) : (

                            <>

                              {
                                profileData.isFollowing === true? (
                                    <button className="text-sm font-medium text-sky-500">
                                      Unfollow
                                    </button>
                                ) : (
                                    <button className="text-sm font-medium text-neutral-800 hover:text-sky-500">
                                      Follow
                                    </button>
                                )
                              }
                            </>

                      )
                    }

                  </div>
                  <h4 className=" px-3 mb-2  text-base font-medium text-neutral-700">

                    {
                        items.images !== null && items.caption
                    }

                  </h4>

                  <div className="px-3  overflow-hidden w-full h-[320px] flex flex-row justify-center items-center">
                    {
                      items.images !== null ? (
                          items.images.map((image, i) => {
                            return (
                                <img
                                    key={i}
                                    src={image}
                                    alt="post photo"
                                    className="min-w-full min-h-full"
                                />
                            )
                          })
                      ) : (
                          <div className="h-full w-full flex flex-row justify-center items-center bg-gray-100">
                            <h4 className=" px-3 mb-2  text-xl  font-semibold text-neutral-800">
                              {items.caption}
                            </h4>
                          </div>
                      )
                    }


                  </div>

                  <div className="px-4 py-5 flex flex-row justify-s items-center gap-5">
                    <div
                        onClick={async () => {
                          setLoader({
                            status : true,
                            id:items._id
                          })
                          const res = await likePostReq(items._id);
                          setLoader({
                            status : false,
                            id:""
                          })
                          if(res){
                            if(path === "/"){
                              await newsFeedReq()
                            }
                            else {
                              if(user !== "me"){
                                await myPostReq(user);

                              }
                              else {
                                await myPostReq(myProfileData.username);
                              }
                            }

                          }
                        }}
                        className="flex flex-row gap-2 justify-start items-center"
                    >
                      {
                        loader.status && loader.id === items._id && (
                              <div className="loader-dark "></div>
                          )
                      }

                      {
                        loader.id !== items._id  && (

                              <AiFillLike
                                  className={`${
                                      items.isLike ? "text-neutral-800" : "text-neutral-600"
                                  } text-lg`}
                              />
                          )
                      }

                      <h1
                          className={`text-base font-medium hidden md:block ${
                              items.isLike ? "text-neutral-800" : "text-neutral-600"
                          } `}
                      >
                        {items.like} Like

                      </h1>
                    </div>
                    <div
                        onClick={() =>{
                          setCommentPostData("id", items._id);
                          removeCommentList(null)
                          }
                        }
                        className="flex flex-row gap-2 justify-start items-center
                        "
                    >
                      <FaCommentDots className="text-neutral-900 text-lg" />
                      <h1 className="text-base font-medium text-neutral-900 hidden md:block">
                        {items.comment} Comment
                      </h1>
                    </div>

                    <div className="flex flex-row gap-2 justify-start items-center">
                      <FaShare className="text-neutral-900 text-lg" />
                      <h1 className="text-base font-medium text-neutral-900 hidden md:block">
                        {items.view} Share
                      </h1>
                    </div>

                    <div className="flex flex-row flex-grow gap-2 justify-end items-center">
                      <IoBookmark className="text-neutral-800 text-lg" />
                      <h1 className="text-base font-medium text-neutral-800">
                        0 Save
                      </h1>
                    </div>
                  </div>
                </motion.div>
            );
          })}
        </>
    )
  }


};

export default PostCard;
