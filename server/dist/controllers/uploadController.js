"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR_RELATIVE = 'public/uploads/images/products';
const UPLOAD_DIR_ABSOLUTE = path_1.default.join(process.cwd(), UPLOAD_DIR_RELATIVE);
// Ensure upload directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR_ABSOLUTE)) {
    fs_1.default.mkdirSync(UPLOAD_DIR_ABSOLUTE, { recursive: true });
}
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR_ABSOLUTE);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});
// File filter for images
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Not an image! Please upload an image file.'), false); // cb expects Error | null, not string
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});
const uploadImage = (req, res) => {
    // 'image' here should match the field name used in FormData on the client
    const uploader = upload.single('image');
    uploader(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        }
        else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message || 'File upload failed.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        // Construct the public URL
        // IMPORTANT: This assumes the 'public' directory is served statically by Express at the root
        // e.g., app.use(express.static('public')); or app.use('/static', express.static('public'));
        // If public is served under /static, then URL should be /static/uploads/images/products/filename.jpg
        // For now, assuming direct serving from /uploads/...
        const fileUrl = `/uploads/images/products/${req.file.filename}`;
        res.status(201).json({
            message: 'Image uploaded successfully!',
            url: fileUrl
        });
    });
};
exports.uploadImage = uploadImage;
