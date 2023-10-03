import { Link } from 'react-router-dom';

export function StackedLinks() {
  return (
    <div>
      <Link to="/movieApp/RECOMMENDATION" className="entries-link white-text">
        RECOMMENDATION
      </Link>
      <Link to="/movieApp/RATING" className="entries-link white-text">
        RATING
      </Link>
      <Link to="/movieApp/Profile" className="entries-link white-text">
        PROFILE
      </Link>
    </div>
  );
}
