import express from 'express';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';
import dotenv from 'dotenv';
import connectToDb from './config/db.config.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import rateLimit from 'express-rate-limit';

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let limiter = rateLimit({
    max: 500,
    windowMs: 60 * 60 * 1000,
    message: {status: 429, message:"Too many requests from this IP, please try again after an hour"}
});
app.use('/api', limiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
    connectToDb();
});