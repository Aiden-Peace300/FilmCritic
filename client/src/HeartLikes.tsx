import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

const HeartRating: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleHeartClick = () => {
    setIsClicked(!isClicked);
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
