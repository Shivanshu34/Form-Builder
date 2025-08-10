import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  await mongoose.connect(uri, { dbName: 'form_builder' });
  console.log('✅ Mongo connected');
};