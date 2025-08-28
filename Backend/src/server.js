import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport.js';

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
app.use('./api', rateLimit({ windowMs: 60_000, max: 100}));

//Routes
app.use('/auth', authRoutes);
app.use('/api/items', itemRoutes);  

app.get('api/health', (req, res) => {
    res.json({ok : true})
});

//db & start

const { 
    PORT = 5000, 
    MONGO_URI = 'mongodb+srv://shivakumarg885:Shiva290799@@mycluster.ijh6ssz.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster' 
  } = process.env;

  mongoose.connect('mongodb+srv://shivakumarg885:Shiva290799@@mycluster.ijh6ssz.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster').then(() => {
    app.listen(5000, () => console.log(`API on http://localhost:${5000}`));
    })
    .catch(err => {
        console.error('Mongo connection error', err);
        process.exit(1);
      });
