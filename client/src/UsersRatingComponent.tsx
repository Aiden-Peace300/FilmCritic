import { useLocation, useNavigate } from 'react-router-dom';
import './RatingComponent.css';
import { useState, useCallback } from 'react';
import StarRating from './StarRating';
import './ShowDetailsOfSuggestedFilm.css';
import './RatingComponent.css';

type FilmDetails = {
  idImdb: string;
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  type: string;
};

export default function UsersRatingComponent() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0); // Initialize with a default value
  const [note, setNote] = useState('');
  const location = useLocation();
  const detailsObj = location.state as FilmDetails;

  console.log(location.state);
  console.log(detailsObj);
  const handleRatingChange = (newRating: number) => {
    setRating(newRating); // Update the 'rating' state when a star is clicked
  };
  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        const idImdb = detailsObj.idImdb;

        // // Extract idImdb from the URL
        // const { idImdb } = detailsObj;
        console.log(idImdb);

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        console.log(
          'Adding movie to films table and RatedFilms:',
          idImdb,
          detailsObj
        );

        const releaseYearNumber = parseInt(detailsObj.releaseYear, 10);

        const responseFilms = await fetch('/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idImdb,
            filmTitle: detailsObj.film,
            genre: detailsObj.genre,
            type: detailsObj.type,
            releaseYear: releaseYearNumber,
            creator: detailsObj.creator,
            description: detailsObj.description,
            trailer: detailsObj.trailer,
          }),
        });

        const responseRatedFilms = await fetch('/api/rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({ idImdb, rating, userNote: note }),
        });

        if (responseFilms.status === 201) {
          console.log('Movie added to films table');
          window.location.reload();
          navigate('/movieApp/rating');
        } else if (responseFilms.status === 200) {
          console.log('Movie already in films table');
          window.location.reload();
          navigate('/movieApp/rating');
        } else {
          console.error('Failed to add movie to films table');
        }

        if (responseRatedFilms.status === 201) {
          console.log('Movie added to watchlist');
        } else if (responseRatedFilms.status === 200) {
          console.log('Movie already in watchlist');
        } else {
          console.error('Failed to add movie to watchlist');
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
      }
    },
    [rating, note, navigate]
  );

  return (
    <>
      <h1>RATING</h1>

      {detailsObj && (
        <div className="body">
          <div className="rowDetails">
            <div className="column-half center">
              <img
                className="rateImageDetails"
                src={detailsObj.poster}
                alt={`${detailsObj.film}`}
              />
            </div>
            <div className="column-half">
              <div className="center-mobile space">
                <p className="red-text center-mobile inline">FILM: </p>
                <p className="white-text center-mobile inline">
                  {detailsObj.film}
                </p>
                <br />
                <p className="red-text center-mobile inline">RELEASE YEAR:</p>
                <p className="white-text center-mobile inline">
                  {detailsObj.releaseYear}
                </p>
                <br />
                <p className="red-text center-mobile inline">TYPE: </p>
                <p className="white-text center-mobile inline">
                  {detailsObj.type}
                </p>
                <br />
                <p className="red-text center-mobile inline">CREATOR: </p>
                <p className="white-text center-mobile inline">
                  {detailsObj.creator}
                </p>
                <br />
                <div className="grid-container">
                  <textarea
                    placeholder="TYPE NOTE HERE"
                    className="note inline"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}></textarea>
                  <div className="star">
                    <StarRating onRatingChange={handleRatingChange} />
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => addToFilmsTableAndWatchlist(detailsObj)}
                    className="ratedFilm">
                    POST
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
