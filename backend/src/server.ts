import { app } from './app.js';
import { config } from './config/index.js';
import { connectDB } from './utils/database.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(config.port, () => {
      console.log(`✓ Server running on http://localhost:${config.port}`);
      console.log(`✓ Environment: ${config.env}`);
      console.log(`✓ Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
