import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ marginTop: '1rem' }}>
          <span>
            &copy;{' '}
            <a href="https://github.com/Aiden-Peace300" target="_blank">
              Aiden Peace
            </a>
            , 2023. All rights reserved.
          </span>
        </div>
        <div className="footer">
          <div>
            <a href="https://www.imdb.com/" target="_blank">
              Powered by IMDb
            </a>
          </div>
          <div>
            <a
              href="https://platform.openai.com/docs/introduction"
              target="_blank">
              Powered by Open AI
            </a>
          </div>
          <div>
            <a
              href="https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability/details"
              target="_blank">
              Powered by Streaming Availability
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
