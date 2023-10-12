import { Fragment, useState, useCallback, useEffect } from 'react';
import StarRating from './StarRating.tsx';
import { useNavigate } from 'react-router-dom';

interface FilmDetails {
  idImdb: string;
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  description: string;
  trailer: string;
  type: string;
  rating: string;
  genre: string;
}

export default function EditPostComponent() {
  const navigate = useNavigate();
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const idImdb = extractParameterFromCurrentUrl();

  const fetchFilmDetailsCallback = useCallback(async () => {
    if (idImdb) {
      try {
        const newDetailsObj = await fetchFilmDetails(idImdb);
        if (newDetailsObj) {
          setDetailsObj(newDetailsObj);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }, [idImdb]);

  /**
   * Extracts the IMDB ID from the current URL.
   * @returns {string | null} - The extracted IMDB ID or null if not found.
   */
  function extractParameterFromCurrentUrl() {
    const currentUrl = window.location.href;
    const regexPattern = /\/tt([0-9]+)/;

    const match = currentUrl.match(regexPattern);

    if (match && match.length > 1) {
      return match[0].substring(1);
    }
    return null;
  }

  useEffect(() => {
    fetchFilmDetailsCallback();
  }, [fetchFilmDetailsCallback]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  async function fetchFilmDetails(id: string) {
    const key = 'k_ei6ruv0h';

    try {
      const response = await fetch(
        `https://imdb-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
      );

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return;
      }

      const responseData = await response.json();

      if (!responseData) {
        console.error('API response is empty');
        return;
      }

      const newDetailsObj: FilmDetails = {
        idImdb: responseData.id || '',
        poster: responseData.image || '',
        film: responseData.title || '',
        releaseYear: responseData.year || '',
        creator:
          responseData.tvSeriesInfo?.creators || responseData.writers || '',
        description: responseData.plot || '',
        trailer: responseData.trailer?.linkEmbed || '',
        type: responseData.ratings?.type || '',
        rating: responseData.ratings?.imDb || '',
        genre: responseData.genres || '',
      };

      setDetailsObj(newDetailsObj);
      console.log('newDetailsObj', newDetailsObj);
      return newDetailsObj;
    } catch (error) {
      console.error('Error:', error);
    }
  }

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
          navigate('/movieApp/profile');
        } else if (responseFilms.status === 200) {
          console.log('Movie already in films table');
          navigate('/movieApp/profile');
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

  console.log(detailsObj);

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
                  {detailsObj && (
                    <Fragment>
                      <button
                        onClick={() => addToFilmsTableAndWatchlist(detailsObj)}
                        className="ratedFilm">
                        POST
                      </button>
                      {/* Use navigate here within the Fragment */}
                      <button
                        onClick={() => navigate('/movieApp/profile')}
                        className="ratedFilm">
                        CANCEL
                      </button>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
