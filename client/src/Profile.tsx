export type PageTypeInsideApp = 'Logout';
import WatchListHistory from './WatchListHistory';
import RatedHistoryComponent from './RatedHistoryComponent';
import './Profile.css';

interface InsideWebsiteNavBarProps {
  onNavigate: (pageNew: PageTypeInsideApp) => void;
}

export default function ProfileComponent({
  onNavigate,
}: InsideWebsiteNavBarProps) {
  return (
    <>
      <div className="profile Container">
        <button
          type="button"
          onClick={() => onNavigate('Logout')}
          className="logout-button">
          Logout
        </button>
      </div>
      {/* Render your component here */}
      <WatchListHistory />
      <RatedHistoryComponent />
    </>
  );
}
