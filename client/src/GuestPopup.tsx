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
  // const navigate = useNavigate();

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
          <button
            style={{ fontSize: '1.4rem' }}
            className="button delete"
            onClick={() => onNavigate('Logout')}>
            Sign-up
          </button>
          <button
            className="button cancel"
            onClick={() => onNavigate('Logout')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestPopup;
