import { Fragment, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrepopulatedStars from './PrepopulatedStars.tsx';

interface FilmDetails {
  idImdb: string;
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  type: string;
  genre: string;
}

export default function EditPostComponent() {
  const navigate = useNavigate();
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [note, setNote] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rating, setRating] = useState(0);

  const idImdb = extractParameterFromCurrentUrl();

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

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

  const gettingUsersPastRating = useCallback(
    async (filmDetails: FilmDetails | null) => {
      if (filmDetails) {
        try {
          const response = await fetch(`/api/Edit/ratedFilms/${idImdb}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          });
          console.log('response', response);

          if (response.status === 404) {
            console.error('Resource not found (404)');
          } else if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              console.log('data[0].userNote', data[0].userNote);
              setRating(data[0].rating);
              setNote(data[0].userNote);
            }
          } else {
            console.error(
              'Failed to fetch user rating and note from the server'
            );
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    },
    [idImdb]
  );

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
      await fetchFilmDetailsCallback();
      if (detailsObj) {
        await gettingUsersPastRating(detailsObj);
      }
    };

    fetchData();
  }, [detailsObj, fetchFilmDetailsCallback, gettingUsersPastRating]);

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
        type: responseData.ratings?.type || '',
        genre: responseData.genres || '',
      };

      setDetailsObj(newDetailsObj);
      return newDetailsObj;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  console.log('NOTES', note);

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
                    <PrepopulatedStars
                      rated={rating}
                      onRatingChange={handleRatingChange}
                    />
                  </div>
                </div>
                <div>
                  {detailsObj && (
                    <Fragment>
                      <button
                        onClick={() => gettingUsersPastRating(detailsObj)}
                        className="ratedFilm">
                        EDIT
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
