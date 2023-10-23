export type PageTypeInsideApp = 'Logout';

import WatchListHistory from './WatchListHistory';
import RatedHistoryComponent from './RatedHistoryComponent';
import ProfilePicture from './ProfileDetails';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GuestPopup from './GuestPopup';

export default function ProfileComponent() {
  const navigate = useNavigate();
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  // Function to close the GuestPopup
  const handleCloseGuestPopup = () => {
    setShowGuestPopup(false);
  };

  // Function to check if the user is an UnknownUser
  const checkUnknownUser = async () => {
    try {
      const response = await fetch('/api/check-unknown-user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userExists) {
          // User is an UnknownUser, show the GuestPopup
          setShowGuestPopup(true);
        }
      } else {
        throw new Error('Failed to check if user is UnknownUser');
      }
    } catch (error) {
      console.error('Error checking if user is UnknownUser:', error);
    }
  };

  useEffect(() => {
    // Check if the user is an UnknownUser when the component mounts
    checkUnknownUser();
  }, []);

  function handleNavigateInsideApp(pageNew: PageTypeInsideApp) {
    navigate(pageNew);
    if (pageNew === 'Logout') {
      sessionStorage.removeItem('token');
      navigate('Logout');
      navigate('/');
    }
  }

  return (
    <>
      <ProfilePicture onNavigate={handleNavigateInsideApp} />
      <WatchListHistory />
      <RatedHistoryComponent />
      {showGuestPopup && (
        <GuestPopup
          onClose={handleCloseGuestPopup}
          onNavigate={handleNavigateInsideApp}
        />
      )}
    </>
  );
}
