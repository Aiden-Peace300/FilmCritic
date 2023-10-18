import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

type HeartRatingProps = {
  onHeartClick: (isClicked: boolean) => void;
};

const HeartRating: React.FC<HeartRatingProps> = ({ onHeartClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleHeartClick = () => {
    setIsClicked(!isClicked);
    onHeartClick(!isClicked); // Call the callback function to update the parent component's state
  };

  return (
    <div>
      <FaHeart
        size={40}
        style={{
          cursor: 'pointer',
          transition: 'color 200ms',
          color: isClicked ? 'red' : 'grey',
        }}
        onClick={handleHeartClick}
      />
    </div>
  );
};

export default HeartRating;
