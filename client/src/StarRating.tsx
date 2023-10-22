import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import './RatingComponent.css';

type StarRatingProps = {
  onRatingChange: (newRating: number) => void;
};

/**
 * StarRating component for displaying and allowing user rating selection.
 * @param {object} props - The props for the StarRating component.
 * @param {function} props.onRatingChange - Callback function to handle rating changes.
 * @returns {JSX.Element} - JSX element containing star rating interface.
 */
const StarRating: React.FC<StarRatingProps> = ({ onRatingChange }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  /**
   * Handles the click event when a star is clicked.
   * @param {number} newRating - The new rating value.
   */
  const handleStarClick = (newRating: number) => {
    setRating(newRating);
    onRatingChange(newRating); // Call the callback function to update the parent component's rating state
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
              onClick={() => handleStarClick(ratingValue)} // Call handleStarClick when a star is clicked
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
      <p className="rated-prompt">{rating} STARS</p>
    </div>
  );
};

export default StarRating;
