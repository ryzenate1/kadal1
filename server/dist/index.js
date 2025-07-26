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
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const product_1 = __importDefault(require("./routes/product"));
const order_1 = __importDefault(require("./routes/order"));
const loyalty_1 = __importDefault(require("./routes/loyalty"));
const category_1 = __importDefault(require("./routes/category"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const trustedBadgeRoutes_1 = __importDefault(require("./routes/trustedBadgeRoutes"));
const featured_fish_1 = __importDefault(require("./routes/featured-fish"));
const fishPicksRoutes_1 = __importDefault(require("./routes/fishPicksRoutes"));
const blog_posts_1 = __importDefault(require("./routes/blog-posts"));
const content_1 = __importDefault(require("./routes/content"));
const status_1 = __importDefault(require("./routes/status"));
const users_1 = __importDefault(require("./routes/users"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const settings_1 = __importDefault(require("./routes/settings"));
const media_1 = __importDefault(require("./routes/media"));
const shipping_1 = __importDefault(require("./routes/shipping"));
// Load environment variables
dotenv_1.default.config();
// Initialize Prisma client
exports.prisma = new client_1.PrismaClient();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
// Add this near the top of the file
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || 'http://localhost:3001';
// Update the CORS configuration
app.use((0, cors_1.default)({
    origin: [CLIENT_ORIGIN, ADMIN_ORIGIN, '*'], // Allow specific origins + all in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/products', product_1.default);
app.use('/api/orders', order_1.default);
app.use('/api/loyalty', loyalty_1.default);
app.use('/api/categories', category_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/trusted-badges', trustedBadgeRoutes_1.default);
app.use('/api/featured-fish', featured_fish_1.default);
app.use('/api/fish-picks', fishPicksRoutes_1.default);
app.use('/api/blog-posts', blog_posts_1.default);
app.use('/api/content', content_1.default);
app.use('/api/status', status_1.default);
app.use('/api/admin/users', users_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/media', media_1.default);
app.use('/api/shipping', shipping_1.default);
// Create or get test users endpoint
app.get('/api/setup-test-users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bcrypt = require('bcryptjs');
        // Hash passwords
        const adminPassword = yield bcrypt.hash('admin123', 10);
        const customerPassword = yield bcrypt.hash('customer123', 10);
        // Create or update test admin user
        let adminUser = yield exports.prisma.user.upsert({
            where: { phoneNumber: '9876543210' },
            update: {
                password: adminPassword,
                role: 'admin'
            },
            create: {
                name: 'Kadal Thunai Admin',
                email: 'admin@kadalthunai.com',
                phoneNumber: '9876543210',
                password: adminPassword,
                role: 'admin',
                loyaltyPoints: 1250,
                loyaltyTier: 'Gold'
            }
        });
        // Create or update test customer user
        let customerUser = yield exports.prisma.user.upsert({
            where: { phoneNumber: '9876543211' },
            update: {
                password: customerPassword,
                role: 'customer'
            },
            create: {
                name: 'Test Customer',
                email: 'customer@example.com',
                phoneNumber: '9876543211',
                password: customerPassword,
                role: 'customer',
                loyaltyPoints: 350,
                loyaltyTier: 'Bronze'
            }
        });
        res.json({
            message: 'Test users created/updated successfully',
            adminId: adminUser.id,
            customerId: customerUser.id,
            adminCredentials: {
                phoneNumber: '9876543210',
                password: 'admin123',
                role: 'admin'
            },
            customerCredentials: {
                phoneNumber: '9876543211',
                password: 'customer123',
                role: 'customer'
            }
        });
    }
    catch (error) {
        console.error('Error setting up test users:', error);
        res.status(500).json({
            message: 'Error setting up test users',
            error: error.message
        });
    }
}));
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Handle graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
    console.log('Disconnected from database');
    process.exit(0);
}));
