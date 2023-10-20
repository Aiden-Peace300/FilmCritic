import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

type HeartRatingProps = {
  idImdb: string;
  initialLikes: number;
  onUpdateLikes: (idImdb: string, newLikes: number) => void;
};

const HeartRating: React.FC<HeartRatingProps> = ({
  idImdb,
  initialLikes,
  onUpdateLikes,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleHeartClick = async () => {
    try {
      // Toggle the like status
      setIsClicked(!isClicked);

      // Calculate the new number of likes
      const newLikes = isClicked ? likes - 1 : likes + 1;
      setLikes(newLikes);

      // Make an API request to update the likes in the database
      const response = await fetch(`/api/likes/${idImdb}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ likes: newLikes }),
      });

      if (!response.ok) {
        console.error('Failed to update likes');
        // Handle the error here
      } else {
        // Call the callback to update the likes in your component
        onUpdateLikes(idImdb, newLikes);
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle the error here
    }
  };

  return (
    <div>
      <FaHeart
        size={50}
        style={{
          marginTop: '1rem',
          cursor: 'pointer',
          transition: 'color 200ms',
          color: isClicked ? '#DB3434' : 'grey',
        }}
        onClick={handleHeartClick}
      />
    </div>
  );
};

export default HeartRating;
