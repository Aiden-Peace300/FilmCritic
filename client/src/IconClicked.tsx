import { Link } from 'react-router-dom';

/**
 * IconClicked component to display navigation links.
 *
 * This component displays a set of links for navigating to different sections of the application.
 * - FEED
 * - RECOMMENDATION
 * - RATING
 * - PROFILE
 */
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
