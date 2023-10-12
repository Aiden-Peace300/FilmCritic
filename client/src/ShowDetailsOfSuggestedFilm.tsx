import { useState, useEffect, useCallback } from 'react';
import netflixLogo from './images/nexflix-logo.png';
import primeLogo from './images/Amazon-Prime-Video-Icon.png';
import disneyLogo from './images/Disney-Plus-Logo.png';
import peacockLogo from './images/peacock-logo.png';
import appleLogo from './images/AppleTv.png';
import hboLogo from './images/hbo-logo.png';
import huluLogo from './images/hulu-logo.png';
import paramountLogo from './images/paramount-logo.png';
import starzLogo from './images/Starz-logo.png';
import showtimeLogo from './images/showtime-logo.png';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

type FilmDetails = {
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  description: string;
  trailer: string;
  type: string;
  rating: string;
  genre: string;
};

export default function ShowDetailsOfSuggestedFilm() {
  const navigate = useNavigate();
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]); // State to store platform names
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Adds the film to the films table and watchlist.
   * @param {FilmDetails} detailsObj - Film details to be added.
   */
  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        // Extract idImdb from the URL
        const idImdb = extractParameterFromCurrentUrl();

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        console.log(
          'Adding movie to films table and watchlist:',
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

        const responseWatchlist = await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({ idImdb }),
        });

        if (responseFilms.status === 201) {
          console.log('Movie added to films table');
        } else if (responseFilms.status === 200) {
          console.log('Movie already in films table');
        } else {
          console.error('Failed to add movie to films table');
        }

        if (responseWatchlist.status === 201) {
          console.log('Movie added to watchlist');
          navigate(-1);
          console.log('Movie already in watchlist');
          navigate(-1);
        } else {
          console.error('Failed to add movie to watchlist');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [navigate]
  );

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

  /**
   * Retrieves streaming platforms for the film.
   * @param {string | null} nameOfFilm - The name of the film.
   */
  const getStreamingPlatforms = useCallback(
    async (nameOfFilm: string | null) => {
      try {
        if (!nameOfFilm) {
          console.error('nameOfFilm is missing');
          return;
        }

        const apiKey = '1d8984c313msh20ce3032c3ab337p129762jsnad07952e57f1';
        const url = `https://streaming-availability.p.rapidapi.com/get?imdb_id=${nameOfFilm}&show_type=all&output_language=en`;

        const get = {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
          },
        };

        const response = await fetch(url, get);
        if (!response.ok) throw new Error(`fetch Error ${response.status}`);
        const responseData = await response.json();

        // Check if there is a "US" entry in streamingInfo
        if (
          responseData.result.streamingInfo &&
          responseData.result.streamingInfo.us
        ) {
          const platformArray = responseData.result.streamingInfo.us.map(
            (streamingPlatform: any) => streamingPlatform.service
          );

          console.log('platformArray: ', platformArray);
          setPlatforms(platformArray);

          // Set isLoading based on the presence of platforms
          setIsLoading(platformArray.length === 0 ? true : false);
        } else {
          // No "US" entry in streamingInfo
          console.log('No streaming platforms in the US');
          setPlatforms([]); // Clear any previous platform data
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    async function fetchFilmDetails(id: string) {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');

      try {
        const response = await fetch(
          `https://imdb-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
        );

        console.log('IMDB API IN fetchFilmDetails');

        if (response.status === 404) {
          console.error('Resource not found (404)');
          return;
        }

        if (!response.ok) {
          console.error('Failed to fetch data from IMDb API');
          return;
        }

        const responseData = await response.json();

        const newDetailsObj = {
          poster: responseData.image ?? '',
          film: responseData.title ?? '',
          releaseYear: responseData.year ?? '',
          creator:
            (responseData.tvSeriesInfo?.creators || responseData.writers) ?? '',
          description: responseData.plot ?? '',
          trailer: responseData.trailer?.linkEmbed ?? '',
          type: responseData.ratings.type ?? '',
          rating: responseData.ratings.imDb ?? '',
          genre: responseData.genres ?? '',
        };

        setDetailsObj(newDetailsObj);
        getStreamingPlatforms(idImdb);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    const idImdb = extractParameterFromCurrentUrl();
    if (idImdb) {
      fetchFilmDetails(idImdb);
    }
  }, [getStreamingPlatforms, addToFilmsTableAndWatchlist]);

  return (
    <div>
      {detailsObj ? (
        <div className="body">
          <div className="containerDetails">
            <div className="rowDetails">
              <div className="col-half">
                <img
                  className="imageDetails"
                  src={detailsObj.poster}
                  alt={`${detailsObj.film}`}
                />
              </div>
              <div className="col-half">
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
                  <p className="red-text center-mobile inline">
                    GENERAL RATING:
                  </p>
                  <p className="white-text center-mobile inline">{` ${detailsObj.rating} / 10`}</p>
                  <br />
                  <p className="red-text center-mobile inline">CREATOR: </p>
                  <p className="white-text center-mobile inline">
                    {detailsObj.creator}
                  </p>
                </div>
                <br />
                <p className="red-text pad space-top">DESCRIPTION: </p>
                <p className="white-text pad space-top">
                  {detailsObj.description}
                </p>
              </div>
            </div>
          </div>
          <p className="red-text pad">TRAILER: </p>
          <iframe
            className="trailer "
            title="Trailer"
            src={detailsObj.trailer}
            frameBorder="0"
            allowFullScreen></iframe>
          <div className="containerDetails">
            <p className="red-text center-mobile center">ADD TO WATCHLIST:</p>
            <div className="center-mobile center">
              <button
                className="add-watchlist-button center"
                onClick={() => addToFilmsTableAndWatchlist(detailsObj)}>
                ADD TO WATCHLIST
              </button>
            </div>
            <p className="red-text pad">STREAMING: </p>
            {isLoading ? (
              <h1>Loading Streaming Apps...</h1>
            ) : (
              // Replace with the new conditional rendering
              <>
                {platforms.length === 0 ? (
                  <>
                    <h2
                      style={{ textAlign: 'center' }}
                      className="no-streaming-info">
                      NOT STREAMING ON COMMON PLATFORMS IN THE UNITED STATES
                    </h2>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'white', marginBottom: '2rem' }}>
                      Click to Icon(s) below to start Streaming:{' '}
                    </p>
                    {platforms.includes('netflix') && (
                      <img className="netflix-size clickMe" src={netflixLogo} />
                    )}
                    {platforms.includes('prime') && (
                      <img className="prime-size clickMe" src={primeLogo} />
                    )}
                    {platforms.includes('disney') && (
                      <img className="disney-size clickMe" src={disneyLogo} />
                    )}
                    {platforms.includes('peacock') && (
                      <img className="peacock-size clickMe" src={peacockLogo} />
                    )}
                    {platforms.includes('apple') && (
                      <img className="apple-size clickMe" src={appleLogo} />
                    )}
                    {platforms.includes('hbo') && (
                      <img className="hbo-size clickMe" src={hboLogo} />
                    )}
                    {platforms.includes('hulu') && (
                      <img className="hulu-size clickMe" src={huluLogo} />
                    )}
                    {platforms.includes('paramount') && (
                      <img
                        className="paramount-size clickMe"
                        src={paramountLogo}
                      />
                    )}
                    {platforms.includes('starz') && (
                      <img className="starz-size clickMe" src={starzLogo} />
                    )}
                    {platforms.includes('showtime') && (
                      <img
                        className="showtime-size clickMe"
                        src={showtimeLogo}
                      />
                    )}
                  </>
                )}
              </>
            )}
            <p className="red-text pad ref-links">REFERRAL LINKS: </p>
            <p className="white-text pad space-below">
              Help us grow and support our website by using our referral link.
              It's like giving our website a high-five and saying, 'Keep up the
              good work!'
            </p>
          </div>
        </div>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
}
