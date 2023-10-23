import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

type HeartRatingProps = {
  idImdb: string;
  initialLikes: number;
  userId: number;
  onUpdateLikes: (idImdb: string, newLikes: number, userId: number) => void;
};

const HeartRating: React.FC<HeartRatingProps> = ({
  idImdb,
  initialLikes,
  userId,
  onUpdateLikes,
}) => {
  const [isLiked, setIsLiked] = useState(false); // Track whether the user has liked the post

  const handleHeartClick = async () => {
    try {
      if (!isLiked) {
        // If not liked, the user clicks to like

        // Calculate the new like count immediately
        const newLikes = initialLikes + 1;

        // Update the UI with the new like count
        onUpdateLikes(idImdb, newLikes, userId);

        // Make the API request
        const response = await fetch(`/api/likes/${idImdb}/${userId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ likes: newLikes }),
        });

        if (!response.ok) {
          // Handle API request error here
          console.error('Failed to update likes');
          // You can display an error message to the user

          // Revert the optimistic update
          onUpdateLikes(idImdb, initialLikes, userId);
        } else {
          // User has liked the post
          setIsLiked(true);
        }
      } else {
        // If already liked, the user clicks to unlike

        // Calculate the new like count immediately
        const newLikes = initialLikes + 1 - 1;

        // Update the UI with the new like count
        onUpdateLikes(idImdb, newLikes, userId);

        // Make the API request
        const response = await fetch(`/api/likes/${idImdb}/${userId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ likes: newLikes }),
        });

        if (!response.ok) {
          // Handle API request error here
          console.error('Failed to update likes');
          // You can display an error message to the user

          // Revert the optimistic update
          onUpdateLikes(idImdb, initialLikes, userId);
        } else {
          // User has unliked the post
          setIsLiked(false);
        }
      }
    } catch (error) {
      // Handle other errors
      console.error('Error:', error);
      // You can display an error message to the user

      // Revert the optimistic update
      onUpdateLikes(idImdb, initialLikes, userId);
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
          color: isLiked ? '#DB3434' : 'grey', // Change color based on liking
        }}
        onClick={handleHeartClick}
      />
    </div>
  );
};

export default HeartRating;
