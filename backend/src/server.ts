import dotenv from 'dotenv';

// Load environment variables as early as possible so imported modules can read them
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import chatRoutes from './routes/chat.routes';
import debugRoutes from './routes/debug.routes';
import homeRoutes from './routes/home.routes';
import seedRoutes from './routes/seed.routes';
import communityRoutes from './routes/community.routes';
import profileRoutes from './routes/profile.routes';
import adminPanelRoutes from './routes/adminPanel.routes';
import { errorHandler } from './middleware/error.middleware';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CivicHub API Server is running! 🚀',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminPanelRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
