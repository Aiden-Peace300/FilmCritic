import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import logo from './images/Logo.jpg';
import { PageType } from './NavBar';
import { useNavigate } from 'react-router-dom';

/**
 * Type for different page types in the NavBar.
 */
export type PageType = 'movieApp' | 'register' | 'sign-in' | 'sign-out';

/**
 * Functional component representing the website's navigation bar.
 * @returns {JSX} JSX links for for Nav bar
 */
export function NavBar() {
  // State variable to track whether the mobile icon is clicked
  const [isIconClicked, setIconClicked] = useState(false);
  const navigate = useNavigate();

  /**
   * Function to toggle the mobile icon click state.
   */
  const toggleIconClicked = () => {
    setIconClicked(!isIconClicked);
  };

  const handleNavigate = (page: PageType) => {
    if (page === 'sign-out') {
      sessionStorage.removeItem('token');
    }
    navigate(page);
  };

  return (
    <>
      <header className="header gray-background">
        <div className="navbar">
          <img src={logo} height="50" alt="Film critic logo" className="logo" />
          <div className="bars-icon icon-padding" onClick={toggleIconClicked}>
            <FontAwesomeIcon icon={faBars} />
          </div>
        </div>
      </header>
      {isIconClicked && (
        <nav className="list-container">
          <ul>
            <li>
              <button onClick={() => handleNavigate('movieApp')}>Home</button>
            </li>
            <li>
              <button onClick={() => handleNavigate('register')}>
                Register
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigate('sign-in')}>Sign In</button>
            </li>
            <li>
              <button onClick={() => handleNavigate('sign-out')}>
                Sign Out
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
