import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import logo from './images/Logo.jpg';
import { PageType } from './NavBar';

/**
 * Type for different page types in the NavBar.
 */
export type PageType = 'movieApp' | 'register' | 'sign-in' | 'sign-out';

/**
 * Props for the NavBar component.
 */
interface NavBarProps {
  onNavigate: (page: PageType) => void;
}

/**
 * Functional component representing the website's navigation bar.
 * @returns {JSX} JSX links for Nav bar
 */
export function NavBar({ onNavigate }: NavBarProps) {
  const [isIconClicked, setIconClicked] = useState(false);

  const toggleIconClicked = () => {
    setIconClicked(!isIconClicked);
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
              <button onClick={() => onNavigate('movieApp')}>Home</button>
            </li>
            <li>
              <button onClick={() => onNavigate('register')}>Register</button>
            </li>
            <li>
              <button onClick={() => onNavigate('sign-in')}>Sign In</button>
            </li>
            <li>
              <button onClick={() => onNavigate('sign-out')}>Sign Out</button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
