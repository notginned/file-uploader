import { NextFunction, Request, RequestHandler, Response } from "express";
import { upload } from "../config/storage/upload.js";
import { File } from "../models/file.js";
import path from "node:path";

const uploadSingleFile = [
  upload.single("uploaded_file"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new Error("Couldn't upload file"));
    if (!req.user) return;

    const originalname = req.file.originalname;
    const name = req.file.filename;
    const destination = req.file.destination;
    const parentId = req.query.id as string;

    console.log({ name, destination });

    const ownerId = req.user.id;
    await File.createFile({
      name: originalname,
      parentId,
      ownerId,
      path: destination + "/" + name,
    });
    return res.redirect("/drive");
  },
];

const getFolderContents: RequestHandler = async (req, res, next) => {
  if (!req.user) return next(new Error("No user found"));

  // The id of the current folder is the parentId of its children
  const parentId = req.params.id as string;
  const ownerId = req.user.id as number;

  const files = await File.getChildrenByParentId({ parentId, ownerId });

  console.log({ parentId, ownerId });
  return res.render("drive", { files, parentId });
};

const downloadSingleFile: RequestHandler = async (req, res, next) => {
  if (!req.user) return next(new Error("No user found"));

  const ownerId = req.user.id as number;
  const id = req.params.id as string;

  const file = await File.getFileById({ id });

  if (!file) return next(new Error("File not found"));

  // Can only download files that belong to the user
  // Can not download folders
  if (file.ownerId !== ownerId || file.type !== "FILE") {
    return next(new Error("Not authorized to download this file"));
  }

  // Files will always have an associated path
  return res.sendFile(path.join(import.meta.dirname, "../../" + file.path!));
};

export { uploadSingleFile, getFolderContents, downloadSingleFile };
