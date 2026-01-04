const mongoose = require('mongoose');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    department: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
});

// Password hashing method
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Admin = mongoose.model('Admin', adminSchema);

async function createFirstAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if any admin exists
        const count = await Admin.countDocuments();
        if (count > 0) {
            console.log('❌ Admin already exists. Count:', count);
            process.exit(0);
        }

        // Create first super admin
        const admin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@codemeet.com',
            password: 'Admin@123',
            role: 'super-admin',
            department: 'IT',
            isActive: true
        });

        console.log('✅ Super Admin created successfully!');
        console.log('Email:', admin.email);
        console.log('Password: Admin@123');
        console.log('Role:', admin.role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createFirstAdmin();
