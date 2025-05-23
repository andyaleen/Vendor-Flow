import mongoose from 'mongoose';

// MongoDB connection configuration
const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://andy:J%40nuary25@cluster0.z5txog3.mongodb.net/vendorflow?retryWrites=true&w=majority&appName=Cluster0";
    
    await mongoose.connect(mongoUri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    
    console.log('MongoDB Atlas connected successfully!');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export { connectMongoDB };
export default mongoose;