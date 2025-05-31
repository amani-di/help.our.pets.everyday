// api/refuge/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../../config/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Obtient un refuge spécifique par son ID
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

    console.log(`Récupération du refuge avec l'ID: ${id}`);
    
    const db = await connectDB();
    
    // Récupérer le refuge avec les informations de l'utilisateur
    const refuge = await db.collection('refuge')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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
    
    if (!refuge || refuge.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Refuge non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`Refuge trouvé: ${refuge[0].nom}`);
    
    return NextResponse.json({
      success: true,
      data: refuge[0],
      message: 'Refuge récupéré avec succès'
    });
    
  } catch (error) {
    console.error(`Erreur lors de la récupération du refuge: ${error.message}`);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors de la récupération du refuge' },
      { status: 500 }
    );
  }
}