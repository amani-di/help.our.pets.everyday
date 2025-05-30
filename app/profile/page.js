//app/profile/page.js
'use client'

import ProfilePage from '../component/profile';

export default function ProfilePageWrapper({ params }) {
  return <ProfilePage params={params} />;
}