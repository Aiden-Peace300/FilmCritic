import { useEffect, useState } from 'react';
import './WatchlistDeletePopup.css';

type EditBioTypes = {
  onClose: () => void;
};

const EditProfileBio: React.FC<EditBioTypes> = ({ onClose }) => {
  const [newBio, setNewBio] = useState(''); // State to store the new bio

  useEffect(() => {
    // Fetch the user's existing bio
    fetchUserBio();
  }, []);

  const fetchUserBio = async () => {
    try {
      const response = await fetch('/api/userBio', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNewBio(data.profileBio); // Set the user's existing bio in the state
      } else {
        console.error('Failed to fetch user bio');
      }
    } catch (error) {
      console.error('Error fetching user bio:', error);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setNewBio(text);
    }
  };

  const saveBio = async () => {
    // Make an API request to save the updated bio
    try {
      const response = await fetch('/api/enter/userBio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ profileBio: newBio }), // Send the updated bio
      });

      if (response.ok) {
        // Bio updated successfully

        // Refresh the window
        window.location.reload();

        onClose(); // Close the editing popup
      } else {
        console.error('Failed to update user bio');
      }
    } catch (error) {
      console.error('Error updating user bio:', error);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="message">
          <textarea
            value={newBio} // Display the new bio
            onChange={handleBioChange}
            rows={20} // Adjust the number of rows as needed
            cols={50}
            maxLength={500} // Set the maximum character limit
            placeholder="Edit your bio here (max 500 characters)"
          />
        </div>
        <div className="buttons-container">
          <button className="button delete" onClick={saveBio}>
            Save
          </button>
          <button className="button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileBio;
