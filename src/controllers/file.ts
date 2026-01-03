import { NextFunction, Request, RequestHandler, Response } from "express";
import { upload } from "../config/storage/upload.js";
import { File } from "../models/file.js";
import path from "node:path";
import { supabase } from "../utils/db.js";
import { readFile, unlink } from "node:fs/promises";

const uploadSingleFile = [
    upload.single("uploaded_file"),
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) return next(new Error("Couldn't upload file"));
        if (!req.user) return;

        const originalname = req.file.originalname;
        const name = req.file.filename;
        const destination = req.file.destination;
        const parentId = req.body.parentId || undefined;
        const ownerId = req.user.id;

        const { id } = await File.createFile({
            name: originalname,
            parentId,
            ownerId,
        });

        const file = await readFile(req.file.path);

        const { data, error } = await supabase.storage
            .from(ownerId.toString())
            .upload(id, file, { contentType: req.file.mimetype });

        console.log('db: ', { id, name, destination, parentId, ownerId });
        console.log("uploaded file", data);

        if (error) {
            return res.render("drive", { error });
        }

        // Deleting the file from disk
        await unlink(req.file.path)

        return res.redirect("/drive");
    },
];

const createFolder: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("User not found"));

    const ownerId = req.user.id;
    const { name } = req.body;
    const parentId = req.body.parentId || undefined;

    const { id } = await File.createFolder({ ownerId, name, parentId });
    return res.redirect(`/drive/${id}`);
};

const getFolderContents: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("No user found"));

    // The id of the current folder is the parentId of its children
    const parentId = req.params.id as string;
    const ownerId = req.user.id as number;

    const files = await File.getChildrenByParentId({
        parentId: parentId ?? null,
        ownerId,
    });

    try {
        const allChildren = await File.getAllChildrenByParentId({ parentId, ownerId });
        console.log(allChildren);
    } catch (e) {
        console.error('error', e)
        console.error(parentId, ownerId)
    }

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
    // TODO: Add downloading
    const path = `${ownerId}/${id}`;

    console.log('path', path);
    const { data, error } = await supabase.storage.from(ownerId.toString()).createSignedUrl(id, 60);

    console.log(data);

    if (error) return res.status(400).send(error);

    return res.status((200)).redirect(data.signedUrl);
};

export { uploadSingleFile, createFolder, getFolderContents, downloadSingleFile };
