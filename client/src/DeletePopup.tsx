import React from 'react';

interface DeleteConfirmationPopupProps {
  onClose: () => void;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  onClose,
}) => {
  return (
    <div className="overlay">
      <div className="popup">
        <div className="message">
          Are you sure you would like to delete this Film from your watchlist?
        </div>
        <button className="button delete">Delete</button>
        <button className="button cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
