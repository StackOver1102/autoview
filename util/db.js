// connectDb.js
const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://nguyendinhtu11022002:IoDFGqoGbAb4K5OT@autoview.wp5sd.mongodb.net/?retryWrites=true&w=majority&appName=AuToView', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the database connection fails
  }
};

module.exports = connectDb;
