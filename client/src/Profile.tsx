export type PageTypeInsideApp = 'Logout';

import WatchListHistory from './WatchListHistory';
import RatedHistoryComponent from './RatedHistoryComponent';
import ProfilePicture from './ProfileDetails';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

export default function ProfileComponent() {
  const navigate = useNavigate();

  function handleNavigateInsideApp(pageNew: PageTypeInsideApp) {
    navigate(pageNew);
    if (pageNew === 'Logout') {
      sessionStorage.removeItem('token');
      navigate('Logout');
      navigate('/sign-in');
    }
  }
  return (
    <>
      <ProfilePicture onNavigate={handleNavigateInsideApp} />
      {/* Render your component here */}
      <WatchListHistory />
      <RatedHistoryComponent />
    </>
  );
}
