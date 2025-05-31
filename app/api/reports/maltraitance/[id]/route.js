// api/reports/maltraitance/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectDB } from '../../../../config/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to get user info from all user collections
async function getUserInfo(db, userId) {
  let user = null;
  
  // Try to find user in each collection with CORRECT collection names
  const collections = [
    { name: 'user', nameField: ['name', 'firstName', 'lastName'] },
    { name: 'veterinaire', nameField: ['clinicName'] },
    { name: 'association', nameField: ['associationName'] },
    { name: 'animalrie', nameField: ['storeName'] }
  ];
  
  for (const collection of collections) {
    user = await db.collection(collection.name).findOne(
      { _id: userId },
      { projection: { email: 1, phone: 1, firstName: 1, lastName: 1, name: 1, clinicName: 1, associationName: 1, storeName: 1 } }
    );
    
    if (user) {
      // Determine the name based on collection type
      let displayName = 'Not specified';
      
      if (collection.name === 'user') {
        displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not specified';
      } else if (collection.name === 'veterinaire') {
        displayName = user.clinicName || 'Veterinarian';
      } else if (collection.name === 'animalrie') {
        displayName = user.storeName || 'Store';
      } else if (collection.name === 'association') {
        displayName = user.associationName || 'Association';
      }
      
      return {
        name: displayName,
        email: user.email || 'Not specified',
        phone: user.phone || 'Not specified'
      };
    }
  }
  
  // If user not found in any collection
  return {
    name: 'Not specified',
    email: 'Not specified',
    phone: 'Not specified'
  };
}

export async function GET(request, { params }) {
  try {
    // Authentication verification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify that user is an association
    if (session.user.userType !== 'association') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Only associations can view abuse reports.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // ID validation
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Database connection
    const db = await connectDB();

    // Retrieve the specific report
    const report = await db.collection('reports').findOne({
      _id: new ObjectId(id),
      reportType: 'maltraitance'
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Get user information using the helper function
    const userInfo = await getUserInfo(db, report.userId);

    // Prepare response data
    const reportWithUserInfo = {
      ...report,
      _id: report._id.toString(),
      userId: report.userId.toString(),
      userInfo: userInfo
    };

    return NextResponse.json(
      {
        success: true,
        data: reportWithUserInfo
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching report details:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}