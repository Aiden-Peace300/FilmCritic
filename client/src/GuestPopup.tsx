import React from 'react';
import './WatchlistDeletePopup.css';

interface DeleteConfirmationPopupProps {
  onClose: () => void;
}

const GuestPopup: React.FC<DeleteConfirmationPopupProps> = ({ onClose }) => {
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
          features like adding films you enjoy <br />
          to your watchlist history. <br />
          And making personalized post on <br />
          films your already acquainted with.
        </div>
        <div className="buttons-container">
          <button style={{ fontSize: '1.4rem' }} className="button delete">
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
