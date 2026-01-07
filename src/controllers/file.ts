import { NextFunction, Request, RequestHandler, Response } from "express";
import { upload } from "../config/storage/upload.js";
import { File } from "../models/file.js";
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

const renameFolder: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("User not found"));

    const ownerId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    try {
        await File.updateFolderById({ id, newName: name, ownerId });
        res.redirect(`/drive/${id}`);
    } catch (e) {
        return next(e);
    }
}

const getFolderContents: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("No user found"));

    // The id of the current folder is the parentId of its children
    const parentId = req.params.id as string;
    const ownerId = req.user.id as number;

    const files = await File.getChildrenByParentId({
        parentId: parentId ?? null,
        ownerId,
    });

    const folder = parentId && await File.getFileById({ id: parentId, ownerId });

    if (folder === "") return next(new Error("Cannot find folder"));

    return res.render("drive", { files, parentId, folderName: folder?.name });
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
    const { data, error } = await supabase.storage.from(ownerId.toString()).createSignedUrl(id, 60);

    if (error) return res.status(400).send(error);

    return res.status((200)).redirect(data.signedUrl);
};

const deleteFile: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("No user found"));

    const { id } = req.params;
    const ownerId = req.user.id;

    try {
        const file = await File.deleteFileById({ id, ownerId });
        const { data, error } = await supabase.storage.from(ownerId.toString()).remove([id]);
        console.log('deleted', { file, data, error });
        res.redirect('/drive');
    } catch (e) {
        return next(e);
    }
}

const deleteFolder: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("No user found"));

    const { id: parentId } = req.params;
    const ownerId = req.user.id;

    try {
        const children = await File.getAllChildrenByParentId({ parentId, ownerId });

        const allIds = children
            .map(({ id, type }) => ({ id, type }))
            .filter((p): p is { id: string, type: "DIR" | "FILE" } => p.id !== null && p.type !== null);

        const fileIds = allIds
            .filter((child) => child.type === "FILE")
            .map(c => c.id)

        await File.deleteFilesById({ ids: allIds.map(child => child.id).concat(parentId), ownerId })

        const { data, error } = await supabase.storage.from(ownerId.toString()).remove(fileIds);

        res.redirect('/drive');
    } catch (e) {
        return next(e);
    }
}

const deleteResource: RequestHandler = async (req, res, next) => {
    if (!req.user) return next(new Error("No user found"));

    const { id: parentId } = req.params;
    const ownerId = req.user.id;

    try {
        const file = await File.getFileById({ id: parentId, ownerId });
        if (file === null) throw new Error("File not found")

        if (file.type === "FILE") {
            return deleteFile(req, res, next);
        } else if (file.type === "DIR") {
            return deleteFolder(req, res, next);
        }
    } catch (e) {
        return next(e);
    }
}

export { uploadSingleFile, createFolder, getFolderContents, downloadSingleFile, deleteResource, renameFolder };
