import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      return;
    }

    // Normalize email to avoid case-sensitivity / accidental whitespace issues
    const normalizedEmail = String(email).toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
      return;
    }


    // Create new user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });
    console.log('✅ User created and saved to DB:', user);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register user.',
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user and include password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login.',
    });
  }
};

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refresh token.',
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          role: user.role,
          notifications: user.notifications,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user profile.',
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user (client should delete tokens)
// @access  Private
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please delete your tokens on the client side.',
  });
};
