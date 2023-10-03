import { Link } from 'react-router-dom';

export function IconClicked() {
  return (
    <>
      <div className="flex-container">
        <Link to="/movieApp" className="icon-text">
          FEED
        </Link>
        <Link to="/movieApp/RECOMMENDATION" className="icon-text">
          RECOMMENDATION
        </Link>
        <Link to="/movieApp/RATING" className="icon-text">
          RATING
        </Link>
        <Link to="/movieApp/Profile" className="icon-text">
          PROFILE
        </Link>
      </div>
    </>
  );
}
