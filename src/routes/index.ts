import { Router } from "express";
import multer from "multer";
import { login } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import {
    uploadFile,
    listFiles,
    getFile,
    retryFile,
    getLogs
} from "../controllers/fileController"

const router = Router();
const upload = multer({
    storage:multer.diskStorage({
        destination:process.env.FILES_UPLOAD_DIR!,
        filename:(_, file, cb)=> cb(null, Date.now()+''+file.originalname)
    })
});

router.post("/login",login)
router.post("/upload",authenticate, upload.single("file"), uploadFile)
router.get("/",authenticate, listFiles)
router.get("/:id",authenticate, getFile)
router.post("/:id/retry",authenticate, retryFile)
router.get("/:id/logs",authenticate, getLogs)

export default router;