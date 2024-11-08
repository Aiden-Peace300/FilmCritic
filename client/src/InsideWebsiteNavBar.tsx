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

  console.log('setListVisible', setListVisible);

  const toggleListVisibility = () => {
    setListVisible(!isListVisible);
  };

  return (
    <>
      <header className="header red-background">
        <div className="navbar">
          <img src={logo} height="50" alt="Film critic logo" className="logo" />
          <div className="nav-links">
            <div className="margin-right">
              <Link to="/movieApp" className="entries-link white-text">
                FEED
              </Link>
            </div>
            <div className="margin-right">
              <Link
                to="/movieApp/recommendation"
                className="entries-link white-text">
                RECOMMENDATION
              </Link>
            </div>
            <div className="margin-right">
              <Link to="/movieApp/rating" className="entries-link white-text">
                RATING
              </Link>
            </div>
            <div className="margin-right">
              <Link to="/movieApp/Profile" className="entries-link white-text">
                PROFILE
              </Link>
            </div>
          </div>
          <div className="bars-icon" onClick={toggleListVisibility}>
            <FontAwesomeIcon icon={faBars} />
          </div>
        </div>
      </header>
      {isListVisible && (
        <div className="list-container" onClick={toggleListVisibility}>
          <IconClicked />
        </div>
      )}
    </>
  );
}
