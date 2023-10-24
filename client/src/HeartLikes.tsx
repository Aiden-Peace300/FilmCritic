import { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';

type HeartRatingProps = {
  idImdb: string; // Expect idImdb to be a string
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
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const likedPosts = JSON.parse(
      sessionStorage.getItem('likedPosts') || '[]'
    ) as string[];
    setIsLiked(idImdb ? likedPosts.includes(idImdb) : false);
  }, [idImdb]);

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
          console.error('Failed to update likes');
          onUpdateLikes(idImdb, initialLikes, userId);
        } else {
          // User has liked the post
          setIsLiked(true);

          // Update likedPosts in sessionStorage
          const likedPosts = JSON.parse(
            sessionStorage.getItem('likedPosts') || '[]'
          ) as string[];
          likedPosts.push(idImdb);
          sessionStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        }
      } else {
        // If already liked, the user clicks to unlike

        // Calculate the new like count immediately
        const newLikes = initialLikes - 1;

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

          // Update likedPosts in sessionStorage
          const likedPosts = JSON.parse(
            sessionStorage.getItem('likedPosts') || '[]'
          ) as string[];
          const index = likedPosts.indexOf(idImdb);
          if (index !== -1) {
            likedPosts.splice(index, 1);
            sessionStorage.setItem('likedPosts', JSON.stringify(likedPosts));
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
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
          color: isLiked ? '#DB3434' : 'grey',
        }}
        onClick={handleHeartClick}
      />
    </div>
  );
};

export default HeartRating;
