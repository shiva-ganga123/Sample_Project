import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

// Import config first to ensure environment variables are loaded
import config from './config/index.js';
import './utils/passport.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: config.clientOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);  

app.get('/api/health', (req, res) => 
    res.json({ok : true})
);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

// Connect to the database and start the server
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(config.port, () => {
            console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
            console.log(`CORS-enabled for ${config.clientOrigin}`);
        });
        
        // Handle unhandled promise rejections after server is created
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err);
            // Close server & exit process
            server.close(() => process.exit(1));
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
