import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import './styles/footer.module.css';
import './styles/navbar.module.css';
import Header from './component/navbar';
import Footer from './component/footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

  
export const metadata = {
  title: 'Animal Shelter Donations',
  description: 'Help animals in need with your donations',
}; 


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
 
 
   
