// api/don/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../config/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Obtient un don spécifique par son ID
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'ID invalide' },
        { status: 400 }
      );
    }

    console.log(`Récupération du don avec l'ID: ${id}`);
    
    const db = await connectDB();
    
    // Récupérer le don avec les informations du type et de l'utilisateur
    const don = await db.collection('don')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'type',
            localField: 'typeId',
            foreignField: '_id',
            as: 'typeInfo'
          }
        },
        {
          $lookup: {
            from: 'user',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: 'veterinaire',
            localField: 'userId',
            foreignField: '_id',
            as: 'vetInfo'
          }
        },
        {
          $lookup: {
            from: 'association',
            localField: 'userId',
            foreignField: '_id',
            as: 'associationInfo'
          }
        },
        {
          $lookup: {
            from: 'animalrie',
            localField: 'userId',
            foreignField: '_id',
            as: 'storeInfo'
          }
        },
        {
          $unwind: {
            path: '$typeInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            userInfo: {
              $cond: {
                if: { $gt: [{ $size: '$userInfo' }, 0] },
                then: { $arrayElemAt: ['$userInfo', 0] },
                else: {
                  $cond: {
                    if: { $gt: [{ $size: '$vetInfo' }, 0] },
                    then: { $arrayElemAt: ['$vetInfo', 0] },
                    else: {
                      $cond: {
                        if: { $gt: [{ $size: '$associationInfo' }, 0] },
                        then: { $arrayElemAt: ['$associationInfo', 0] },
                        else: {
                          $cond: {
                            if: { $gt: [{ $size: '$storeInfo' }, 0] },
                            then: { $arrayElemAt: ['$storeInfo', 0] },
                            else: null
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            vetInfo: 0,
            associationInfo: 0,
            storeInfo: 0,
            'userInfo.password': 0
          }
        }
      ])
      .toArray();
    
    if (!don || don.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Don non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`Don trouvé: ${don[0].nom}`);
    
    return NextResponse.json({
      success: true,
      data: don[0],
      message: 'Don récupéré avec succès'
    });
    
  } catch (error) {
    console.error(`Erreur lors de la récupération du don: ${error.message}`);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors de la récupération du don' },
      { status: 500 }
    );
  }
}