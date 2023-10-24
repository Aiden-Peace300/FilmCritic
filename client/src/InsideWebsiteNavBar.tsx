import logo from './images/Logo.jpg';
import { IconClicked } from './IconClicked';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export type PageTypeInsideApp =
  | 'FEED'
  | 'RECOMMENDATION'
  | 'RATING'
  | 'Profile'
  | 'icon-clicked';

/**
 * InsideWebsiteNavBar component for the navigation bar within the website.
 *
 * This component provides navigation links to the "FEED," "RECOMMENDATION," "RATING," and "PROFILE" pages.
 * It also includes a mobile navigation menu with the "Bars" icon to toggle visibility.
 */
export function InsideWebsiteNavBar() {
  const [isListVisible, setListVisible] = useState(false);

  const toggleListVisibility = () => {
    setListVisible(!isListVisible);
  };

  return (
    <>
      <header className="header gray-background">
        <div className="row">
          <div className="d-flex align-center">
            <img
              src={logo}
              height="70"
              alt="Film critic logo"
              className="logo"
            />
            <nav className="nav-links">
              <Link to="/movieApp" className="entries-link white-text">
                FEED
              </Link>
              <Link
                to="/movieApp/recommendation"
                className="entries-link white-text">
                RECOMMENDATION
              </Link>
              <Link to="/movieApp/rating" className="entries-link white-text">
                RATING
              </Link>
              <Link to="/movieApp/Profile" className="entries-link white-text">
                PROFILE
              </Link>
            </nav>
            <div className="bars-icon" onClick={toggleListVisibility}>
              <FontAwesomeIcon icon={faBars} />
            </div>
          </div>
        </div>
      </header>
      {isListVisible && (
        <div className="list-container">
          <IconClicked />
        </div>
      )}
    </>
  );
}
