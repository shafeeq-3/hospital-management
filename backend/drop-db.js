import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Database dropped successfully');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

dropDatabase();
