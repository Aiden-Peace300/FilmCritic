// import React from "react";
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <div>
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;

        return (
          <label key={i}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
            />
            <FaStar
              style={{ cursor: 'pointer', transition: 'color 200ms' }}
              color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              size={50}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)} // Initialize with 0
            />
          </label>
        );
      })}
      <p style={{ paddingLeft: '5rem' }}>the rating is {rating}.</p>
    </div>
  );
};

export default StarRating;
