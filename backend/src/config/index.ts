import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tinylink',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  version: '1.0',
};
