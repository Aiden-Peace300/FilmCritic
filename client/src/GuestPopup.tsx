import React from 'react';
import './WatchlistDeletePopup.css';
// import { useNavigate } from 'react-router-dom';
export type PageTypeInsideApp = 'Logout';

interface DeleteConfirmationPopupProps {
  onNavigate: (pageNew: PageTypeInsideApp) => void;
  onClose: () => void;
}

const GuestPopup: React.FC<DeleteConfirmationPopupProps> = ({
  onClose,
  onNavigate,
}) => {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="message">
          This is a guest account. <br />
          <br />
          Creating an account with FilmCritic
          <br />
          will allow you to experience all the incredible <br />
          features of this web application. <br />
          Features like adding films you enjoy <br />
          to your watchlist history <br />
          and making personalized posts on <br />
          films you're already acquainted with.
          <br />
          <br />
          As a way to showcase our full features to you,
          <br />
          our guest account is a shared account. Feel free to add
          <br />
          family-friendly films to the watchlist and make posts
          <br />
          about films you've watched!
          <br />
        </div>
        <div className="buttons-container">
          <button
            style={{ fontSize: '1.4rem' }}
            className="button delete"
            onClick={() => onNavigate('Logout')}>
            Sign-up
          </button>
          <button className="button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestPopup;
