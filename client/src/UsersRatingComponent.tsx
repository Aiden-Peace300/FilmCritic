import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import StarRating from './StarRating';
import './RatingComponent.css';
import './ShowDetailsOfSuggestedFilm.css';
import Footer from './Footer';

interface FilmDetails {
  idImdb: string;
  filmTitle: string;
  genre: string;
  type: string;
  releaseYear: string;
  creator: string;
  description: string;
  generalRating: string;
  poster: string;
  trailer: string;
}

/**
 * This component allows users to rate and review a film.
 */
export default function UsersRatingComponent() {
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

  useEffect(() => {
    fetchFilmDetailsCallback();
  }, [fetchFilmDetailsCallback]);

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

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  /**
   * Fetch film details from the IMDb API.
   * @param {string} id - IMDb ID of the film.
   * @returns {Promise<FilmDetails | void>} - The film details or void if there's an error.
   */
  async function fetchFilmDetails(id: string) {
    const key = 'k_ei6ruv0h';

    try {
      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
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
        idImdb: responseData.id ?? '',
        poster: responseData.image ?? '',
        filmTitle: responseData.title ?? '',
        releaseYear: responseData.year ?? '',
        creator:
          (responseData.tvSeriesInfo?.creators || responseData.writers) ?? '',
        description: responseData.plot ?? '',
        trailer: responseData.trailer?.linkEmbed ?? '',
        type: responseData.ratings.type ?? '',
        generalRating: responseData.ratings.imDb ?? '',
        genre: responseData.genres ?? '',
      };

      setDetailsObj(newDetailsObj);
      return newDetailsObj;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Add film details to the films table and watchlist.
   * @param {FilmDetails} detailsObj - Film details to add.
   */
  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        const idImdb = detailsObj.idImdb;

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        const releaseYearNumber = parseInt(detailsObj.releaseYear, 10);

        const currentTimestamp = new Date().toISOString();

        const responseFilms = await fetch('/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idImdb: detailsObj.idImdb,
            filmTitle: detailsObj.filmTitle,
            genre: detailsObj.genre,
            type: detailsObj.type,
            releaseYear: releaseYearNumber,
            creator: detailsObj.creator,
            description: detailsObj.description,
            generalRating: detailsObj.generalRating,
            poster: detailsObj.poster,
            trailer: detailsObj.trailer,
            createdAt: currentTimestamp, // createdAt handled by the server
            updatedAt: null,
          }),
        });

        if (!note) {
          console.error('Rating or note is missing');
          return;
        }

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
          navigate('/movieApp');
        } else if (responseFilms.status === 200) {
          console.log('Movie already in films table');
          navigate('/movieApp');
        } else {
          console.error('Failed to add movie to films table');
          navigate('/movieApp');
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
      {detailsObj && (
        <div className="body">
          <div className="rowDetails">
            <div className="column-half center">
              <img
                className="rateImageDetails"
                src={detailsObj.poster}
                alt={`${detailsObj.filmTitle}`}
              />
            </div>
            <div className="column-half">
              <div className="center-mobile space col-half-space">
                <div>
                  <p className="red-text center-mobile inline">FILM: </p>
                  <p className="white-text center-mobile inline font-size">
                    {detailsObj.filmTitle}
                  </p>
                </div>
                <br className="br" />
                <div>
                  <p className="red-text center-mobile inline">
                    RELEASE YEAR:{' '}
                  </p>
                  <p className="white-text center-mobile inline font-size">
                    {detailsObj.releaseYear}
                  </p>
                </div>
                <br className="br" />
                <div>
                  <p className="red-text center-mobile inline">TYPE: </p>
                  <p className="white-text center-mobile inline font-size">
                    {detailsObj.type}
                  </p>
                </div>
                <br className="br" />
                <div>
                  <p className="red-text center-mobile inline">CREATOR: </p>
                  <p className="white-text center-mobile inline font-size">
                    {detailsObj.creator}
                  </p>
                </div>
                <br />
                <div>
                  <p className="red-text center-mobile inline">
                    FILL OUT THE FOLLOWING:{' '}
                  </p>
                </div>
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
                <div className="postAndCancel">
                  <button
                    onClick={() => addToFilmsTableAndWatchlist(detailsObj)}
                    className="ratedFilm">
                    POST
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}
