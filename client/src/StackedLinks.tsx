import { Link } from 'react-router-dom';

/**
 * Renders a set of stacked links for navigation.
 * @returns {JSX.Element} JSX element containing stacked links.
 */

export function StackedLinks() {
  return (
    <div>
      {/* Link to the RECOMMENDATION page */}
      <Link to="/movieApp/RECOMMENDATION" className="entries-link white-text">
        RECOMMENDATION
      </Link>
      {/* Link to the RATING page */}
      <Link to="/movieApp/RATING" className="entries-link white-text">
        RATING
      </Link>
      {/* Link to the PROFILE page */}
      <Link to="/movieApp/Profile" className="entries-link white-text">
        PROFILE
      </Link>
    </div>
  );
}
