 // Admin emails list
export const ADMIN_EMAILS = [
  'helpingourpetseveryday@gmail.com',
  'hope65622@gmail.com', // main admin email
  // more admin emails here  
];

// Client-side admin check (pour les composants client)
export const isAdminClient = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};