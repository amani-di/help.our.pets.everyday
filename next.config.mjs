/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour export statique (nécessaire pour Netlify)
  output: 'export',
  
  // Dossier de sortie pour le build statique
  distDir: 'out',
  
  // Ajoute un slash à la fin des URLs
  trailingSlash: true,
  
  // Configuration des images
  images: {
    unoptimized: true, // Nécessaire pour export statique
    domains: ['res.cloudinary.com'], // Garde vos domaines Cloudinary
  },
}

export default nextConfig