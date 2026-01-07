import multer, { FileFilterCallback } from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniquePrefix = crypto.randomUUID();
        const extension = file.originalname.split(".").at(-1);
        cb(null, uniquePrefix + (extension && "." + extension));
    },
});

const validMimeTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp']

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {

    if (!validMimeTypes.includes(file.mimetype)) return cb(null, false);

    if (file.size > 10 /* Mebibytes */ * 1024 /* KibiBytes */ * 1024 /* Bytes*/) return cb(null, false);

    return cb(null, true);
}

export const upload = multer({ storage, fileFilter });
