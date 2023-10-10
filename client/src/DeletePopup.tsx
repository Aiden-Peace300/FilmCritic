import React from 'react';
import './DeletePopup.css';

interface DeleteConfirmationPopupProps {
  onClose: () => void;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  onClose,
}) => {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="message">
          Are you sure you would like to <br />
          delete this Film from your watchlist?
        </div>
        <div className="buttons-container">
          <button className="button delete">Delete</button>
          <button className="button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
