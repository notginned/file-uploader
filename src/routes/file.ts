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

fileRouter.post("/folder/create", async (req, res, next) => {
    if (!req.user) return next(new Error("User not found"));

    const ownerId = req.user.id;
    const { name } = req.body;
    const parentId = req.body.parentId || undefined;

    await File.createFolder({ ownerId, name, parentId });
    return res.redirect(`/drive/${parentId}`);
});
fileRouter.get("/download/:id", downloadSingleFile);

export { fileRouter };
