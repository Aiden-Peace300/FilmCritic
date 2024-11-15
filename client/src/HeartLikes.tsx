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
  const [currentLikes, setCurrentLikes] = useState(initialLikes);

  // check if the post is liked when the component mounts
  useEffect(() => {
    const likedPosts = JSON.parse(
      sessionStorage.getItem('likedPosts') || '[]'
    ) as string[];

    setIsLiked(idImdb ? likedPosts.includes(idImdb) : false);

    // Fetch current likes count from API (or local storage if needed)
    // For now, we assume initialLikes is the current value
    setCurrentLikes(initialLikes);
  }, [idImdb, initialLikes]);

  const handleHeartClick = async () => {
    try {
      if (!isLiked) {
        // User is liking the post

        const newLikes = currentLikes + 1;
        setCurrentLikes(newLikes);
        onUpdateLikes(idImdb, newLikes, userId);

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
          setCurrentLikes(currentLikes); // Revert to previous state if failed
        } else {
          setIsLiked(true);
          const likedPosts = JSON.parse(
            sessionStorage.getItem('likedPosts') || '[]'
          ) as string[];
          likedPosts.push(idImdb);
          sessionStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        }
      } else {
        // User is unliking the post

        const newLikes = currentLikes - 1;
        setCurrentLikes(newLikes);
        onUpdateLikes(idImdb, newLikes, userId);

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
          setCurrentLikes(currentLikes); // Revert to previous state if failed
        } else {
          setIsLiked(false);
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
      setCurrentLikes(currentLikes); // Revert in case of error
    }
  };

  return (
    <div>
      <FaHeart
        size={50}
        style={{
          marginTop: '1rem',
          cursor: 'pointer',
          transition: 'color 0s',
          color: isLiked ? '#DB3434' : 'grey',
        }}
        onClick={handleHeartClick}
      />
    </div>
  );
};

export default HeartRating;
