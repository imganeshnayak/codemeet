import { Request, Response } from 'express';
import Admin, { IAdmin } from '../models/Admin';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

interface AuthRequest extends Request {
  admin?: IAdmin;
}

// Register a new admin (only super-admin can do this)
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'moderator',
      department,
      phone,
    });

    // Generate tokens
    const token = generateAccessToken({ 
      id: admin._id.toString(), 
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });
    const refreshToken = generateRefreshToken({ 
      id: admin._id.toString(), 
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({
      error: 'Failed to register admin',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Admin login
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin with password field
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact super admin.' });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate tokens
    const token = generateAccessToken({ 
      id: admin._id.toString(), 
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });
    const refreshToken = generateRefreshToken({ 
      id: admin._id.toString(), 
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        avatar: admin.avatar,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login admin error:', error);
    res.status(500).json({
      error: 'Failed to login',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get current admin profile
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        phone: admin.phone,
        avatar: admin.avatar,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update admin profile
export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?.id;
    const { name, phone, avatar, department } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Update fields
    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (avatar) admin.avatar = avatar;
    if (department) admin.department = department;

    await admin.save();

    res.json({
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        phone: admin.phone,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Change admin password
export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all admins (super-admin only)
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });

    res.json({
      admins: admins.map((admin) => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        phone: admin.phone,
        avatar: admin.avatar,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      })),
      total: admins.length,
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      error: 'Failed to fetch admins',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update admin status (super-admin only)
export const updateAdminStatus = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const { isActive } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    admin.isActive = isActive;
    await admin.save();

    res.json({
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({
      error: 'Failed to update admin status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete admin (super-admin only)
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findByIdAndDelete(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      error: 'Failed to delete admin',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
