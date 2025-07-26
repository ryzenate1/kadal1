"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../index");
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(__dirname, '../../uploads/images');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path_1.default.extname(file.originalname);
        cb(null, `media-${uniqueSuffix}${fileExtension}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
// Get all media files
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { name: { contains: search } },
                { description: { contains: search } },
                { alt: { contains: search } }
            ]
        } : {};
        const [media, total] = yield Promise.all([
            index_1.prisma.media.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            index_1.prisma.media.count({ where })
        ]);
        res.json({
            media,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({
            message: 'Error fetching media',
            error: error.message
        });
    }
}));
// Get specific media by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const media = yield index_1.prisma.media.findUnique({
            where: { id }
        });
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        res.json(media);
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({
            message: 'Error fetching media',
            error: error.message
        });
    }
}));
// Upload new media file
router.post('/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { alt, description } = req.body;
        const baseUrl = process.env.SERVER_URL || 'http://localhost:5001';
        const fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
        const media = yield index_1.prisma.media.create({
            data: {
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size,
                url: fileUrl,
                alt: alt || '',
                description: description || ''
            }
        });
        res.status(201).json({
            message: 'File uploaded successfully',
            media
        });
    }
    catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({
            message: 'Error uploading media',
            error: error.message
        });
    }
}));
// Update media metadata
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, alt, description } = req.body;
        const media = yield index_1.prisma.media.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (alt !== undefined && { alt })), (description !== undefined && { description })), { updatedAt: new Date() })
        });
        res.json({ message: 'Media updated successfully', media });
    }
    catch (error) {
        console.error('Error updating media:', error);
        res.status(500).json({
            message: 'Error updating media',
            error: error.message
        });
    }
}));
// Delete media
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get media info to delete file
        const media = yield index_1.prisma.media.findUnique({
            where: { id }
        });
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        // Delete from database
        yield index_1.prisma.media.delete({
            where: { id }
        });
        // Delete physical file
        try {
            const filename = path_1.default.basename(media.url);
            const filePath = path_1.default.join(__dirname, '../../uploads/images', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (fileError) {
            console.warn('Could not delete physical file:', fileError);
        }
        res.json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({
            message: 'Error deleting media',
            error: error.message
        });
    }
}));
// Bulk delete media
router.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Media IDs array is required' });
        }
        // Get media info for file deletion
        const mediaFiles = yield index_1.prisma.media.findMany({
            where: { id: { in: ids } }
        });
        // Delete from database
        yield index_1.prisma.media.deleteMany({
            where: { id: { in: ids } }
        });
        // Delete physical files
        mediaFiles.forEach((media) => {
            try {
                const filename = path_1.default.basename(media.url);
                const filePath = path_1.default.join(__dirname, '../../uploads/images', filename);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            catch (fileError) {
                console.warn('Could not delete physical file:', fileError);
            }
        });
        res.json({
            message: `${mediaFiles.length} media files deleted successfully`
        });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({
            message: 'Error deleting media',
            error: error.message
        });
    }
}));
exports.default = router;
