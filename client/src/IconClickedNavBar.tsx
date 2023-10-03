import { Link } from 'react-router-dom';

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
