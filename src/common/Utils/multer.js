import { resolve } from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import fs from "fs";
import { BadRequestException } from "../common/Errors/error.js";

export const fileValdiation = {
  image: ["image/jpg", "image/jpeg", "image/png"],
  video: ["video/mp4", "video/avi", "video/mov"]
};

export const upload = (customPath = "general", valdiation = [], size = 5) => {

  if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let fullPath = resolve(`./uploads/${customPath}`);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },

    filename: function (req, file, cb) {
      const uniqueFileName = randomUUID() + "-" + file.originalname;
      file.finalPath = `uploads/${customPath}/${uniqueFileName}`;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {

    if (!valdiation.includes(file.mimetype)) {
      return cb(
        BadRequestException({
          message: "invalid file type",
          cause: "File type not allowed",
        }),
        false
      );
    }

    return cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: size * 1024 * 1024 },
  });
};