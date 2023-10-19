import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

type HeartRatingProps = {
  onHeartClick: (isClicked: boolean) => void;
};

const HeartRating: React.FC<HeartRatingProps> = ({ onHeartClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleHeartClick = () => {
    setIsClicked(!isClicked);
    onHeartClick(!isClicked);
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
