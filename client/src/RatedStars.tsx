import { FaStar } from 'react-icons/fa';
import './RatedHistoryComponent.css';

type StarRatingProps = {
  rating: number;
};

/**
 * RatedStars displays a set of star icons to represent a given rating.
 * @param {number} rating - The rating value to display using stars.
 * @returns {JSX.Element} - The RatedStars component.
 */
const RatedStars: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="rated-stars-container">
      {[1, 2, 3, 4, 5].map((ratingValue) => (
        <label key={ratingValue}>
          <FaStar
            style={{ transition: 'color 200ms' }}
            color={ratingValue <= rating ? '#DB3434' : '#e4e5e9'}
            size={50}
          />
        </label>
      ))}
    </div>
  );
};

export default RatedStars;
