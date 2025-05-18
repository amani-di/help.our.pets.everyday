// app/api/favorites/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../animals/route';
import { ObjectId } from 'mongodb';

// GET endpoint to retrieve favorite animals from MongoDB based on IDs
export async function GET(request) {
  try {
    // Get the IDs of favorite animals from the URL
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids');
    
    if (!ids) {
      return NextResponse.json({
        success: false,
        message: 'No favorite IDs provided'
      }, { status: 400 });
    }
    
    // Parse the IDs from the comma-separated string
    const favoriteIds = ids.split(',').filter(id => ObjectId.isValid(id));
    
    if (favoriteIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [] // Return empty array if no valid IDs
      });
    }
    
    // Connect to MongoDB
    const db = await connectDB();
    const animalsCollection = db.collection('animals');
    
    // Retrieve animals with the provided IDs
    const favorites = await animalsCollection.find({
      _id: { $in: favoriteIds.map(id => new ObjectId(id)) }
    }).toArray();
    
    return NextResponse.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Error retrieving favorite animals:', error);
    return NextResponse.json({
      success: false,
      message: `Error retrieving favorite animals: ${error.message}`
    }, { status: 500 });
  }
}

// POST endpoint to toggle favorite status (optional enhancement)
export async function POST(request) {
  try {
    // Get request body
    const body = await request.json();
    const { animalId, isFavorite } = body;
    
    if (!animalId || typeof isFavorite !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: animalId and isFavorite'
      }, { status: 400 });
    }
    
    if (!ObjectId.isValid(animalId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid animal ID'
      }, { status: 400 });
    }
    
    // For this implementation, we're just returning success
    // In a real app with user authentication, you would store this in the database
    // associated with the user's account
    
    return NextResponse.json({
      success: true,
      data: {
        animalId,
        isFavorite
      }
    });
  } catch (error) {
    console.error('Error updating favorite status:', error);
    return NextResponse.json({
      success: false,
      message: `Error updating favorite status: ${error.message}`
    }, { status: 500 });
  }
}