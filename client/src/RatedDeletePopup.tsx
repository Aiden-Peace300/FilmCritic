import React from 'react';
import './WatchlistDeletePopup.css';

interface DeleteConfirmationPopupProps {
  onClose: () => void;
  idImdb: string | null; // Update the type to accept null
}

/**
 * DeleteConfirmationPopup is a component for confirming the deletion of a post from FilmCritic.
 * @param {Function} onClose - A function to close the popup.
 * @param {string | null} idImdb - The ID of the post to be deleted or null if not available.
 */
const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  onClose,
  idImdb,
}) => {
  if (idImdb === null) {
    return null; // Return null if idImdb is null
  }

  // Function to handle the deletion when the "Delete" button is clicked
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/rated/${idImdb}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item from rated history');
      }

      // Refresh the window
      window.location.reload();

      // Close the popup after successful deletion
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="message">
          Are you sure you would like to delete
          <br />
          this Post from FilmCritic?
        </div>
        <div className="buttons-container">
          <button className="button delete" onClick={handleDelete}>
            Delete
          </button>
          <button className="button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
