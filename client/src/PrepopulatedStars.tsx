import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

type StarRatingProps = {
  onRatingChange: (newRating: number) => void;
  rated: number;
};

const StarRating: React.FC<StarRatingProps> = ({
  onRatingChange,
  rated,
}: StarRatingProps) => {
  const [rating, setRating] = useState(rated);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    // Update the rating state with the initial 'rated' value
    setRating(rated);
  }, [rated]);

  const handleStarClick = (newRating: number) => {
    setRating(newRating);
    onRatingChange(newRating);
  };

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
              onClick={() => handleStarClick(ratingValue)}
            />
            <FaStar
              style={{ cursor: 'pointer', transition: 'color 200ms' }}
              color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              size={50}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
      <p style={{ paddingLeft: '5rem' }}>{rating} STARS</p>
    </div>
  );
};

export default StarRating;
