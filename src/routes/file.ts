import { Router } from "express";
import { File } from "../models/file.js";
import {
  downloadSingleFile,
  getFolderContents,
  uploadSingleFile,
} from "../controllers/file.js";
const fileRouter = Router();

fileRouter.get("/{:id}", getFolderContents);
fileRouter.get("/download/{:id}", downloadSingleFile);

fileRouter.post("/upload", uploadSingleFile);

fileRouter.post("/folder/create", async (req, res) => {
  // @ts-expect-error User will always have an id
  const ownerId = req.user.id;
  const { name, parentId } = req.body;

  await File.createFile({ ownerId, name });
  return res.redirect(`/drive/${parentId}`);
});
fileRouter.get("/:fileId", () => {});

export { fileRouter };
