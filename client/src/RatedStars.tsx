import { FaStar } from 'react-icons/fa';

type StarRatingProps = {
  rating: number;
};

const RatedStars: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((ratingValue) => (
        <label key={ratingValue}>
          <FaStar
            style={{ transition: 'color 200ms' }}
            color={ratingValue <= rating ? '#ffc107' : '#e4e5e9'}
            size={50}
          />
        </label>
      ))}
      {/* <p style={{ paddingLeft: '5rem' }}>{rating} STARS</p> */}
    </div>
  );
};

export default RatedStars;
