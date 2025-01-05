import { motion } from "framer-motion";
import { AiFillLike } from "react-icons/ai";
import { FaCommentDots, FaShare } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import { useState } from "react";

const PostCard = () => {
  let [like, addLike] = useState(null);

  return (
    <>
      {Array.from(Array(28).keys()).map((add, i) => {
        return (
          <motion.div
            key={i}
            whileHover={{ opacity: 1, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 },
            }}
            className="max-w-[560px] pt-3 mt-3 rounded shadow mx-auto cursor-pointer"
          >
            <div className="flex flex-row mx-3 gap-3 justify-start items-center">
              <div className=" flex-shrink-0  h-[35px] w-[35px] rounded-full overflow-hidden flex flex-row justify-center items-center">
                <img
                  src="/image/profile.jpg"
                  alt="profile image"
                  className="min-w-full min-h-full"
                />
              </div>
              <div className="mb-2 flex-grow">
                <h2 className="text-base font-medium text-neutral-800">
                  Imran Hossen
                  <span className="text-sm font-normal ms-2 text-sky-500 ">
                    2day ago
                  </span>
                </h2>
                <p className="text-sm text-neutral-600 ">
                  UI/UX Designer | Front-end Developer | Mobile Apps Design{" "}
                </p>
              </div>

              <button className="text-sm font-medium text-neutral-800 hover:text-sky-500">
                Follow
              </button>
            </div>
            <h4 className=" px-3 mb-2  text-sm font-medium text-neutral-800">
              Kenan Foundation Asia believes in a world where everyone has the
              right to build a better life for themselves
            </h4>

            <div className="px-3  overflow-hidden w-full h-[250px] flex flex-row justify-center items-center">
              <img
                src="/image/profile.jpg"
                alt="post photo"
                className="min-w-full min-h-full"
              />
            </div>

            <div className="px-4 py-5 flex flex-row justify-s items-center gap-5">
              <div
                onClick={() => {
                  if (like === null) {
                    addLike(i);
                  } else {
                    addLike(null);
                  }
                }}
                className="flex flex-row gap-2 justify-start items-center"
              >
                <AiFillLike
                  className={`${
                    like === i ? "text-neutral-800" : "text-neutral-600"
                  } text-lg`}
                />
                <h1
                  className={`text-base font-medium ${
                    like === i ? "text-neutral-800" : "text-neutral-600"
                  } `}
                >
                  {like === i ? 2 : 1}
                  Like
                </h1>
              </div>
              <div className="flex flex-row gap-2 justify-start items-center">
                <FaCommentDots className="text-neutral-700 text-lg" />
                <h1 className="text-base font-medium text-neutral-700">
                  1 Comment
                </h1>
              </div>

              <div className="flex flex-row gap-2 justify-start items-center">
                <FaShare className="text-neutral-700 text-lg" />
                <h1 className="text-base font-medium text-neutral-700">
                  1 Share
                </h1>
              </div>

              <div className="flex flex-row flex-grow gap-2 justify-end items-center">
                <IoBookmark className="text-neutral-700 text-lg" />
                <h1 className="text-base font-medium text-neutral-700">
                  1 Save
                </h1>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

export default PostCard;
