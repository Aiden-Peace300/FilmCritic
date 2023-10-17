import React, { useState } from 'react';
import placeholder from './images/ProfilePicture.png';
import './ProfilePicture.css';

export default function ProfileComponent() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  return (
    <div>
      <div className="profile-image-container">
        <img
          src={imageUrl || placeholder} // You can use a placeholder image here
          alt="Profile Picture"
          id="profile-image"
        />
      </div>
      <input
        type="file"
        accept="image/*"
        name="image"
        id="profilePictureInput"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <label htmlFor="profilePictureInput" className="upload-button">
        Upload
      </label>
    </div>
  );
}
