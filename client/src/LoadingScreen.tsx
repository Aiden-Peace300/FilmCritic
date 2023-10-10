import Logo from './images/loading_screen.png';

/**
 * This component displays a loading screen while content is being fetched or loaded.
 * @returns {JSX} JSX representing the loading screen.
 */
export default function LoadingScreen() {
  // Define CSS styles for the container div
  const containerStyle: React.CSSProperties = {
    display: 'flex', // enable flexbox
    flexDirection: 'column', // Display content vertically
    alignItems: 'center', // Center content vertically
    justifyContent: 'center', // Center content horizontally
    height: '40rem', // Optionally, make the container fill the entire viewport height
  };

  // Render the loading screen JSX
  return (
    <div style={containerStyle}>
      {/* Display img with Logo along with alt text "Loading" */}
      <img src={Logo} alt="Loading" />
      {/* Display a heading with the text "Loading..." */}
      <h1>Loading...</h1>
    </div>
  );
}
