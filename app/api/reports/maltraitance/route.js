// api/reports/maltraitance/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../config/mongodb';

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
      } else if (collection.name === 'association') {
        displayName = user.associationName || 'Association';
      } else if (collection.name === 'animalrie') {
        displayName = user.storeName || 'Store';
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

// API GET to retrieve only maltraitance reports (accessible to associations only)
export async function GET(request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const wilaya = searchParams.get('wilaya');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Database connection
    const db = await connectDB();

    // Build search filter (only maltraitance)
    const filter = { reportType: 'maltraitance' };
    
    if (wilaya) {
      filter['location.wilaya'] = wilaya;
    }

    // Retrieve maltraitance reports with pagination
    const reports = await db.collection('reports')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get user information for each report
    const reportsWithUserInfo = await Promise.all(
      reports.map(async (report) => {
        const userInfo = await getUserInfo(db, report.userId);
        
        return {
          ...report,
          _id: report._id.toString(),
          userId: report.userId.toString(),
          userInfo: userInfo
        };
      })
    );

    // Total count for pagination
    const totalReports = await db.collection('reports').countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: reportsWithUserInfo,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReports / limit),
          totalReports: totalReports,
          hasNextPage: page < Math.ceil(totalReports / limit),
          hasPrevPage: page > 1
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching maltraitance reports:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}