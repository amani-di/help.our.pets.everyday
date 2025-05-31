// api/types-signalement/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../config/mongodb';

export async function GET() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    console.log('MongoDB connection established');
    
    // Get all type signalement from collection
    const collection = db.collection('typesignalements');
    const types = await collection.find({}).sort({ nom: 1 }).toArray();
    
    console.log('Types signalement retrieved:', types.length);
    
    return NextResponse.json(
      { success: true, data: types },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching types signalement:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    console.log('MongoDB connection established');
    
    const { nom } = await request.json();
    
    // Validate input
    if (!nom || !['disparition', 'maltraitance'].includes(nom)) {
      return NextResponse.json(
        { success: false, message: 'Invalid type name. Must be "disparition" or "maltraitance"' },
        { status: 400 }
      );
    }
    
    // Check if type already exists
    const collection = db.collection('typesignalements');
    const existingType = await collection.findOne({ nom });
    
    if (existingType) {
      return NextResponse.json(
        { success: false, message: 'Type already exists' },
        { status: 409 }
      );
    }
    
    // Create new type
    const typeData = {
      nom,
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(typeData);
    const savedType = await collection.findOne({ _id: result.insertedId });
    
    console.log('Type signalement created:', savedType);
    
    return NextResponse.json(
      { success: true, data: savedType },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating type signalement:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}