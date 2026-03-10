import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB  from './config/mongodb.js';
import storedAdminCred from './seed/seedDb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';



// Configure __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import connectCloudinary from './config/cloudinary.js';
// import adminRouter from './routes/adminRoute.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Import security and logging packages
import helmet from 'helmet';
import morgan from 'morgan';

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

// Connect to database and cloud services
connectCloudinary();



const startServer = async () => {
    await connectDB();
 // Start server
const server = app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
};

startServer();
// Middlewares
app.use(helmet()); // Security headers

app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes (endpoints) when ever we call this api, the api controler function will be executed
app.use('/api/admin', adminRouter)
//localhost:4000/api/admin/add-doctor

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Handle 404 - Not Found
app.use(notFound);

// Error handling middleware
app.use(errorHandler);



// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
