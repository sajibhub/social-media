import multer from "multer";
import fs from "fs";

const imageUpload = (id) => {
  if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `images`);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${id}${
          new Date().getTime() +
          file.originalname.slice(
            file.originalname.lastIndexOf("."),
            file.originalname.length
          )
        }`
      );
    },
  });

  return multer({ storage: storage });
};

export default imageUpload;
