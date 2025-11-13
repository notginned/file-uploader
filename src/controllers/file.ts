import { NextFunction, Request, RequestHandler, Response } from "express";
import { upload } from "../config/storage/upload.js";
import { File } from "../models/file.js";

const uploadSingleFile = [
  upload.single("uploaded_file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new Error("No file found"));

    const { originalname, destination } = req.file;

    console.log("uploaded: ", originalname, "at ", destination);
    next();
  },
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new Error("Couldn't upload file"));

    const name = req.file.originalname;
    const parentId = req.query.id as string;
    if (!req.user) return;

    const ownerId = req.user.id;
    await File.createFile({ name, parentId, ownerId });
    return res.redirect("/drive");
  },
];

const getFolderContents: RequestHandler = async (req, res, next) => {
  if (!req.user) return next(new Error("No user found"));

  const parentId = req.query.id as string;
  const ownerId = req.user.id as number;
  const contents = await File.getChildrenByParentId({ parentId, ownerId });
  console.log({ contents });

  return res.render("drive", { files: contents });
};

const downloadSingleFile: RequestHandler = async (req, res, next) => {
  if (!req.user) return next(new Error("No user found"));

  const ownerId = req.user.id as number;
  const id = req.query.id as string;

  const file = await File.getFileById({ id });

  if (!file) return next(new Error("File not found"));

  if (file.ownerId !== ownerId)
    return next(new Error("Not authorized to download this file"));
  if (file.type !== "FILE")
    return next(new Error("Not authorized to download this file"));

  // Files will always have an associated path
  return res.sendFile(file.path!);
};

export { uploadSingleFile, getFolderContents, downloadSingleFile };
