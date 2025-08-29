import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import './utils/passport.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';

const app = express();

//Security Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({origin: process.env.CLIENT_ORIGIN, credentials: true}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);  

app.get('/api/health', (req, res) => 
    res.json({ok : true})
);

//db & start

const { PORT = 5000, MONGO_URI } = process.env;

  mongoose.connect(MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Mongo connection error', err);
        process.exit(1);
      });
