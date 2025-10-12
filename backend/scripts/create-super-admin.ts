import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../src/models/Admin';
import connectDB from '../src/config/database';

const createSuperAdmin = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    // Check if super-admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super-admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      process.exit(0);
    }

    // Create super-admin
    const superAdmin = new Admin({
      name: 'Super Admin',
      email: 'admin@civichub.com',
      password: 'admin123456', // Will be hashed automatically
      role: 'super-admin',
      department: 'Administration',
      phone: '+1234567890',
      isActive: true,
    });

    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@civichub.com');
    console.log('   Password: admin123456');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('\n🌐 Admin Portal: http://localhost:8080/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
