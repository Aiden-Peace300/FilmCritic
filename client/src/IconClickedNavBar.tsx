import { Link } from 'react-router-dom';

/**
 * IconClickedNavBar component for displaying navigation links in the navigation bar.
 *
 * This component provides links to navigate to the "Sign Up" and "Login" pages.
 */
export function IconClickedNavBar() {
  return (
    <>
      <div className="flex-container">
        <Link to="/register" className="icon-text">
          Sign Up
        </Link>
        <Link to="/sign-in" className="icon-text">
          Login
        </Link>
      </div>
    </>
  );
}
