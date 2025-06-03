import React from 'react';
import  styles from '../styles/footer.module.css';
import Link from  'next/link';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      
      <div className={styles.footercontent}>
        <div className={styles.footersection}>
          <h3><Link href="/aboutus">About Us</Link> </h3>
          <p>We help connect animals in need with loving homes and provide resources for animal shelters.</p>
        </div>
        
        <div className={styles.footersection}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/catalogueanimal">Adoption Process</Link></li>
            <li><Link href="/hommage">Special Companions</ Link></li>
            <li><Link href="/prendresoin/cats">Animal Care Tips</Link></li>
            <li><Link href="/Donations">Donation</Link></li>
          </ul>
        </div>
        
        <div className={styles.footersection}>
          <h3>Contact Us</h3>
          <p><i className={styles.icon}>📧</i> hope65622@gmail.com</p>
          <p><i className={styles.icon}>📍</i> Annaba</p>
        </div>
        
        <div className={styles.footersection}>
          <h3>Join Us</h3>
          <Link  href="/signuplogin" className={styles.signupbtn}>Sign Up</Link>
          <div className={styles.socialicons}>
            <Link href="#" className={styles.socialicon}>FB</Link>
            <Link href="https://www.instagram.com/hope151611?igsh=anpybWFoODVvMWdj" className={styles.socialicon}>IG</Link>
            <Link href="#" className={styles.socialicon}>TW</Link>
          </div>
        </div>
      </div>
      
      <div className={styles.footerbottom}>
        <p>&copy; 2025 Pet Adoption Platform. All rights reserved.</p>
        <div className={styles.footerlinks}>
          <Link href="#">FAQ</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;