import { Fragment, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrepopulatedStars from './PrepopulatedStars.tsx';
import Footer from './Footer';

interface FilmDetails {
  idImdb: string;
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  type: string;
  genre: string;
}

/**
 * EditPostComponent for editing user ratings and notes for a film.
 */
export default function EditPostComponent() {
  const navigate = useNavigate();
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);

  const idImdb = extractParameterFromCurrentUrl();

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  /**
   * Fetches film details and updates the state with the fetched data.
   */
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
   * Retrieves the user's past rating and note from the server and updates the state.
   */
  const gettingUsersPastRating = useCallback(async () => {
    try {
      const response = await fetch(`/api/Edit/ratedFilms/${idImdb}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.status === 404) {
        console.error('Resource not found (404)');
      } else if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setRating(data[0].rating);
          setNote(data[0].userNote);
        }
      } else {
        console.error('Failed to fetch user rating and note from the server');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [idImdb]);

  /**
   * Extracts the IMDb ID from the current URL.
   * @returns {string | null} - The extracted IMDb ID or null if not found.
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
    const fetchData = async () => {
      fetchFilmDetailsCallback();
      gettingUsersPastRating();
    };

    fetchData();
  }, [fetchFilmDetailsCallback, gettingUsersPastRating]);

  /**
   * Fetches film details from the IMDb API.
   * @param {string} id - The IMDb ID of the film.
   * @returns {Promise<FilmDetails | undefined>} - A Promise that resolves to film details or undefined if not found.
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
        idImdb: responseData.id || '',
        poster: responseData.image || '',
        film: responseData.title || '',
        releaseYear: responseData.year || '',
        creator:
          responseData.tvSeriesInfo?.creators || responseData.writers || '',
        type: responseData.ratings?.type || '',
        genre: responseData.genres || '',
      };

      setDetailsObj(newDetailsObj);
      return newDetailsObj;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Handles the click event when the user wants to edit their rating and note.
   */
  const handleEditClick = async () => {
    try {
      const response = await fetch(`/api/rated/${idImdb}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating, userNote: note }),
      });

      if (response.ok) {
        // Update was successful, you can navigate to another page or show a success message here.
        console.log('Rating and note updated successfully');
        navigate(-1);
      } else {
        // Handle errors or show an error message to the user.
        console.error('Failed to update rating and note');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
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
                <div>
                  <p className="red-text center-mobile inline">FILM: </p>
                  <p className="white-text center-mobile inline font-size">
                    {detailsObj.film}
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
                    EDIT THE FOLLOWING:
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
                    <PrepopulatedStars
                      rated={rating}
                      onRatingChange={handleRatingChange}
                    />
                  </div>
                </div>
                <div className="postAndCancel">
                  {detailsObj && (
                    <Fragment>
                      <button
                        onClick={() => navigate('/movieApp')}
                        className="ratedFilm cancel">
                        CANCEL
                      </button>
                      <button onClick={handleEditClick} className="ratedFilm">
                        POST
                      </button>
                    </Fragment>
                  )}
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
