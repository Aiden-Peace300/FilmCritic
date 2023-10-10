import Logo from './images/loading_screen.png';

export default function LoadingScreen() {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40rem', // Optionally, make it fill the entire viewport height
  };

  return (
    <div style={containerStyle}>
      <img src={Logo} alt="Loading" />
      <h1>Loading...</h1>
    </div>
  );
}
