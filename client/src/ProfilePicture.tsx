import { useEffect, useState } from 'react';
import placeholder from './images/ProfilePicture.png';
import './ProfilePicture.css';
import EditProfileBio from './EditBio';

export default function ProfileComponent() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState<string | null>(null);
  const [isEditBioVisible, setIsEditBioVisible] = useState(false);

  const showEditBio = () => {
    setIsEditBioVisible(true);
  };

  const hideEditBio = () => {
    setIsEditBioVisible(false);
  };

  useEffect(() => {
    try {
      // Fetch the user's profile picture URL when the component mounts
      fetchUserProfilePicture();

      // Fetch the username when the component mounts
      fetchUsername()
        .then((username) => setUsername(username))
        .catch((error) => console.error('Error setting username:', error));

      // Fetch the user's profile bio when the component mounts
      fetchUserBio()
        .then((bio) => setProfileBio(bio))
        .catch((error) => console.error('Error setting user bio:', error));
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  const fetchUserProfilePicture = async () => {
    try {
      // Make an API request to fetch the user's profile picture URL
      const response = await fetch('/api/profilePicture', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        const imageUrl = data.imageUrl;

        setImageUrl(imageUrl);
        console.log('data1', data);
        console.log('imageUrl', imageUrl);
      } else {
        console.error('Failed to fetch user profile picture');
      }
    } catch (error) {
      console.error('Error fetching user profile picture:', error);
    }
  };

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
        const userBio = data.profileBio;
        setProfileBio(userBio);
        return userBio;
      } else {
        console.error('Failed to fetch user bio');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user bio:', error);
      return null;
    }
  };

  async function fetchUsername() {
    try {
      const response = await fetch('/api/username', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const usernameData = await response.json();
        const userUsername = usernameData.username;
        return userUsername.toUpperCase();
      } else {
        console.error('Failed to fetch user username', response);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user username:', error);
      return null;
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/updateProfilePicture', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('data: ', data);
        console.log('File uploaded:', data.imageURL);
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  console.log(imageUrl);

  return (
    <div className="profile-container">
      <div className="profile-row">
        <div className="profile-column profile-image-column">
          <img
            src={imageUrl || placeholder}
            alt="Profile Picture"
            id="profile-image"
          />
        </div>
        <div className="profile-column user-info-column">
          <span className="username">{username || 'Loading UserName...'}</span>
          <p>{profileBio || 'Loading Bio...'}</p>
          <input
            type="file"
            accept="image/*"
            name="image"
            id="profilePictureInput"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="profilePictureInput" className="upload-button">
            Upload Profile Picture
          </label>
          <button onClick={showEditBio}>Edit Bio</button>
        </div>
      </div>
      {isEditBioVisible && <EditProfileBio onClose={hideEditBio} />}
    </div>
  );
}
