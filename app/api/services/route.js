// app/api/services/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '../../config/mongodb';

// Fonction helper pour mapper les types d'utilisateurs aux collections MongoDB
const getUserCollection = (userType) => {
  const collectionMap = {
    'veterinarian': 'veterinaire',
    'association': 'association', 
    'petshop': 'animalrie'
  };
  
  return collectionMap[userType] || null;
};

// Route GET pour récupérer tous les services
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type');
    const search = searchParams.get('search') || '';

    console.log('Récupération des services pour type:', userType);

    // Si aucun type n'est spécifié, récupérer tous les types
    if (!userType) {
      try {
        const db = await connectDB();
        console.log('Connexion DB réussie');
        
        const allServices = {};
        const serviceTypes = ['veterinarian', 'association', 'petshop'];
        
        for (const type of serviceTypes) {
          const collectionName = getUserCollection(type);
          console.log(`Récupération de la collection: ${collectionName}`);
          
          try {
            const services = await db.collection(collectionName)
              .find({})
              .project({ password: 0, __v: 0 }) // Exclure les champs sensibles
              .limit(50)
              .toArray();
            
            console.log(`Services trouvés pour ${type}:`, services.length);
            
            // Formater les données pour être compatibles avec ServiceLocator
            const formattedServices = services.map(service => {
              let formattedService = {
                id: service._id.toString(),
                type: type,
                email: service.email || '',
                phone: service.phone || '',
                address: service.address || '',
                createdAt: service.createdAt
              };

              // Ajouter les champs spécifiques selon le type
              if (type === 'veterinarian') {
                formattedService.name = service.clinicName || 'Clinique Vétérinaire';
                formattedService.licenseNumber = service.licenseNumber || '';
                formattedService.description = service.description || '';
                formattedService.services = service.services || [];
                formattedService.specialties = service.specialties || [];
              } else if (type === 'association') {
                formattedService.name = service.associationName || 'Association';
                formattedService.description = service.description || '';
                formattedService.missionStatement = service.missionStatement || '';
                formattedService.foundedYear = service.foundedYear || null;
              } else if (type === 'petshop') {
                formattedService.name = service.storeName || 'Animalerie';
                formattedService.openingtime = service.openingtime || '';
                formattedService.description = service.description || '';
                formattedService.productCategories = service.productCategories || [];
              }

              return formattedService;
            });
            
            allServices[type] = formattedServices;
          } catch (collectionError) {
            console.error(`Erreur collection ${collectionName}:`, collectionError);
            allServices[type] = [];
          }
        }

        console.log('Services récupérés:', Object.keys(allServices).map(k => `${k}: ${allServices[k].length}`));

        return NextResponse.json({
          success: true,
          services: allServices
        });
        
      } catch (dbError) {
        console.error('Erreur de base de données:', dbError);
        return NextResponse.json({
          success: false,
          message: 'Erreur de connexion à la base de données',
          error: dbError.message
        }, { status: 500 });
      }
    }

    // Si un type spécifique est demandé
    if (!['veterinarian', 'association', 'petshop'].includes(userType)) {
      return NextResponse.json({
        success: false,
        message: 'Type de service invalide'
      }, { status: 400 });
    }

    const db = await connectDB();
    const collectionName = getUserCollection(userType);
    
    if (!collectionName) {
      return NextResponse.json({
        success: false,
        message: 'Type de service non reconnu'
      }, { status: 400 });
    }

    // Construire la requête de recherche
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      if (userType === 'veterinarian') {
        query = {
          $or: [
            { clinicName: { $regex: searchRegex } },
            { address: { $regex: searchRegex } },
            { email: { $regex: searchRegex } }
          ]
        };
      } else if (userType === 'association') {
        query = {
          $or: [
            { associationName: { $regex: searchRegex } },
            { address: { $regex: searchRegex } },
            { email: { $regex: searchRegex } }
          ]
        };
      } else if (userType === 'petshop') {
        query = {
          $or: [
            { storeName: { $regex: searchRegex } },
            { address: { $regex: searchRegex } },
            { email: { $regex: searchRegex } }
          ]
        };
      }
    }

    const services = await db.collection(collectionName)
      .find(query)
      .project({ password: 0, __v: 0 })
      .limit(100)
      .toArray();

    // Formater les données
    const formattedServices = services.map(service => {
      let formattedService = {
        id: service._id.toString(),
        type: userType,
        email: service.email || '',
        phone: service.phone || '',
        address: service.address || '',
        createdAt: service.createdAt
      };

      if (userType === 'veterinarian') {
        formattedService.name = service.clinicName || 'Clinique Vétérinaire';
        formattedService.licenseNumber = service.licenseNumber || '';
        formattedService.description = service.description || '';
        formattedService.services = service.services || [];
        formattedService.specialties = service.specialties || [];
      } else if (userType === 'association') {
        formattedService.name = service.associationName || 'Association';
        formattedService.description = service.description || '';
        formattedService.missionStatement = service.missionStatement || '';
        formattedService.foundedYear = service.foundedYear || null;
      } else if (userType === 'petshop') {
        formattedService.name = service.storeName || 'Animalerie';
        formattedService.openingtime = service.openingtime || '';
        formattedService.description = service.description || '';
        formattedService.productCategories = service.productCategories || [];
      }

      return formattedService;
    });

    return NextResponse.json({
      success: true,
      services: formattedServices
    });

  } catch (error) {
    console.error('Erreur générale:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur serveur interne',
      error: error.message
    }, { status: 500 });
  }
}