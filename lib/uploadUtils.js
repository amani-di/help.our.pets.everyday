import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';  

// Fonction pour enregistrer un fichier téléchargé
export async function saveFile(file, folder = 'uploads') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Créer le chemin pour enregistrer le fichier
  const uploadDir = path.join(process.cwd(), 'public', folder);
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Générer un nom de fichier unique
  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(uploadDir, uniqueFilename);
  
  // Enregistrer le fichier
  await fs.writeFile(filePath, buffer);
  
  // Retourner le chemin relatif pour l'accès via URL
  return `/${folder}/${uniqueFilename}`;
}

// Fonction pour enregistrer plusieurs fichiers
export async function saveFiles(files, folder = 'uploads') {
  const filePromises = Array.from(files).map(file => saveFile(file, folder));
  return Promise.all(filePromises);
}