import multer from "multer";
import path from "path";
import fs from "fs";

// Temp folder untuk simpan file sebelum upload ke Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tmpDir = "tmp_uploads";
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file PDF atau gambar yang diperbolehkan"));
        }
    }
});

export default upload;
