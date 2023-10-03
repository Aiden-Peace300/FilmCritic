import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import logo from './images/Logo.jpg';
import { IconClickedNavBar } from './IconClickedNavBar';
import { Link } from 'react-router-dom';

export type PageType = 'movieApp' | 'register' | 'sign-in' | 'sign-out';

export function NavBar() {
  const [isIconClicked, setIconClicked] = useState(false);

  const toggleIconClicked = () => {
    setIconClicked(!isIconClicked);
  };

  return (
    <>
      <header className="header gray-background">
        <div className="navbar">
          <img src={logo} height="70" alt="Film critic logo" className="logo" />
          <div className="nav-links">
            <div className="signup-container">
              <Link to="/register" className="entries-link white-text">
                Sign Up
              </Link>
            </div>
            <Link to="/sign-in" className="entries-link white-text">
              Login
            </Link>
          </div>
          <div className="bars-icon icon-padding" onClick={toggleIconClicked}>
            <FontAwesomeIcon icon={faBars} />
          </div>
        </div>
      </header>
      {isIconClicked && (
        <div className="list-container">
          <IconClickedNavBar />
        </div>
      )}
    </>
  );
}
