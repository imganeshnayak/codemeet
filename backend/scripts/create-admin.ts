import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jan_awaaz');
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123456', // Change this to your desired password
      role: 'admin' as const,
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      phone: '',
      address: '',
      notifications: {
        emailUpdates: true,
        pushNotifications: true,
        issueUpdates: true,
        communityMessages: false
      }
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      console.log('🔑 Admin ID:', existingAdmin._id);
      console.log('👤 Admin Name:', existingAdmin.name);
      console.log('📧 Admin Email:', existingAdmin.email);
      console.log('🎭 Role:', existingAdmin.role);
      await mongoose.connection.close();
      return;
    }

    // Create admin user (password will be auto-hashed by the pre-save hook)
    const admin = await User.create(adminData);

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin ID:', admin._id);
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('🔐 Password:', adminData.password);
    console.log('🎭 Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Login Instructions:');
    console.log('1. Go to: http://localhost:8080/login');
    console.log('2. Email:', admin.email);
    console.log('3. Password:', adminData.password);
    console.log('4. After login, visit: http://localhost:8080/admin');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
