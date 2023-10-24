import Logo from './images/loading_screen.png';
import './LoadingScreen.css';

/**
 * This component displays a loading screen while content is being fetched or loaded.
 * @returns {JSX} JSX representing the loading screen.
 */
export default function LoadingScreen() {
  return (
    <div className="containerStyle">
      <img className="loading-logo" src={Logo} alt="Loading" />
      <h1>Loading...</h1>
    </div>
  );
}
