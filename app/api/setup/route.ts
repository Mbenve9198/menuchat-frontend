import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/menuchat";

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Restaurant Schema
const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  googlePlaceId: String,
  address: String,
  location: {
    lat: Number,
    lng: Number,
  },
  menuUrl: String,
  hasMenuFile: Boolean,
  reviewPlatform: {
    type: String,
    enum: ['google', 'yelp', 'tripadvisor', 'custom'],
    default: 'google',
  },
  reviewLink: String,
  welcomeMessage: String,
  reviewTimer: {
    type: Number,
    default: 60,
  },
  reviewTemplate: String,
  triggerWord: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define models (only if they don't exist)
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);

interface MongoError extends Error {
  code?: number;
}

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Get form data
    const formData = await request.json();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formData.userPassword, salt);

    // Create user
    const user = new User({
      email: formData.userEmail,
      password: hashedPassword,
      fullName: formData.userFullName,
    });

    // Save user
    await user.save();

    // Create restaurant
    const restaurant = new Restaurant({
      name: formData.restaurantName,
      googlePlaceId: formData.restaurantId,
      address: formData.address,
      location: formData.location,
      menuUrl: formData.menuUrl,
      hasMenuFile: formData.hasMenuFile,
      reviewPlatform: formData.reviewPlatform,
      reviewLink: formData.reviewLink,
      welcomeMessage: formData.welcomeMessage,
      reviewTimer: formData.reviewTimer,
      reviewTemplate: formData.reviewTemplate,
      triggerWord: formData.triggerWord,
      owner: user._id,
    });

    // Save restaurant
    await restaurant.save();

    // Return success response
    return NextResponse.json({ 
      success: true, 
      userId: user._id, 
      restaurantId: restaurant._id 
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in API:', error);
    
    // Check if it's a validation error
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.message 
      }, { status: 400 });
    }

    // Check if it's a duplicate key error (e.g., email already exists)
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email already exists' 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 