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
import plutotvLogo from './images/plutoTv.png';
import tubiLogo from './images/tubi.png';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import Footer from './Footer';

type FilmDetails = {
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
};

/**
 * Component that displays details of a suggested film, along with streaming platforms and an option to add to the watchlist.
 */
export default function ShowDetailsOfSuggestedFilm() {
  const navigate = useNavigate();
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [platforms, setPlatforms] = useState<
    Array<{ name: string; link: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const displayedPlatforms = new Set<string>();

  /**
   * Adds film details to the films table and watchlist.
   * @param {FilmDetails} detailsObj - Details of the film.
   */
  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        const idImdb = extractParameterFromCurrentUrl();

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        const releaseYearNumber = parseInt(detailsObj.releaseYear, 10);

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
          }),
        });

        console.log(
          'responseFilms after adding to films table: ',
          responseFilms
        );

        const responseWatchlist = await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({ idImdb }),
        });

        if (responseWatchlist.status === 201) {
          console.log('Movie added to watchlist');
          navigate(-1);
        } else {
          console.error('Failed to add movie to watchlist');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [navigate]
  );

  /**
   * Extracts IMDB ID from the current URL.
   * @returns {string | null} - The IMDB ID or null if not found.
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

        if (
          responseData.result.streamingInfo &&
          responseData.result.streamingInfo.us
        ) {
          const platformsArray = responseData.result.streamingInfo.us.map(
            (streamingPlatform: any) => {
              // Modify the link for Prime Video if the platform name is 'prime'
              if (streamingPlatform.service === 'prime') {
                streamingPlatform.link += '&tag=filmcriticpea-20';
              }
              return {
                name: streamingPlatform.service,
                link: streamingPlatform.link,
              };
            }
          );

          console.log('platformArray: ', platformsArray);
          setPlatforms(platformsArray);

          setIsLoading(platformsArray.length === 0 ? true : false);
        } else {
          console.log('No streaming platforms in the US');
          setPlatforms([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    /**
     * Fetches film details from the API based on the IMDB ID.
     * @param {string} id - The IMDB ID of the film.
     */
    async function fetchFilmDetails(id) {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');

      let success = false;
      let responseData;

      while (!success) {
        try {
          const response = await fetch(
            `https://tv-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
          );

          console.log('response: ', response);

          if (response.status === 404) {
            console.error('Resource not found (404)');
            return;
          }

          if (response.ok) {
            responseData = await response.json();
            success = true;
          } else {
            console.error('Failed to fetch data from IMDb API, retrying...');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }

      if (responseData) {
        const newDetailsObj = {
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
        getStreamingPlatforms(newDetailsObj.idImdb);
      } else {
        console.error('responseData is undefined');
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
              <div className="col-half col-half-img">
                <img
                  className="imageDetails"
                  src={detailsObj.poster}
                  alt={`${detailsObj.filmTitle}`}
                />
              </div>
              <div
                className="col-half"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '90px',
                }}>
                <div className="center-mobile space col-half-space">
                  <div>
                    <p className="red-text center-mobile inline">FILM: </p>
                    <p className="white-text center-mobile inline">
                      {detailsObj.filmTitle}
                    </p>
                  </div>
                  <br className="br" />
                  <div className="inline2">
                    <p className="red-text center-mobile inline">
                      RELEASE YEAR:{' '}
                    </p>
                    <p className="white-text center-mobile inline">
                      {detailsObj.releaseYear}
                    </p>
                  </div>
                  <br className="br" />
                  <div>
                    <p className="red-text center-mobile inline">TYPE: </p>
                    <p className="white-text center-mobile inline">
                      {detailsObj.type}
                    </p>
                  </div>
                  <div>
                    <br className="br" />
                    <p className="red-text center-mobile inline">
                      GENERAL RATING:
                    </p>
                    <p className="white-text center-mobile inline">{` ${detailsObj.generalRating} / 10`}</p>
                  </div>
                  <br className="br" />
                  <div>
                    <p className="red-text center-mobile inline">CREATOR: </p>
                    <p className="white-text center-mobile inline">
                      {detailsObj.creator}
                    </p>
                  </div>
                  <br />
                  <div>
                    <p className="red-text center-mobile inline">
                      DESCRIPTION:{' '}
                    </p>
                    <p className="white-text center-mobile">
                      {detailsObj.description}
                    </p>
                  </div>
                </div>
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
          <div className="containerStreamingDetails">
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
            ) : platforms.length === 0 ? (
              <p style={{ color: 'white', marginBottom: '2rem' }}>
                No Streaming Applications Available
              </p>
            ) : (
              <>
                <p style={{ color: 'white', marginBottom: '2rem' }}>
                  Click the Icon(s) below to start Streaming:
                </p>
                {platforms.map((platform) => {
                  if (!displayedPlatforms.has(platform.name)) {
                    displayedPlatforms.add(platform.name);
                    return (
                      <a
                        key={platform.name}
                        href={platform.link}
                        target="_blank"
                        rel="noopener noreferrer">
                        <img
                          className={`${platform.name}-size clickMe`}
                          src={getPlatformLogo(platform.name)}
                          alt={platform.name}
                        />
                      </a>
                    );
                  }
                  return null;
                })}
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
      <Footer />
    </div>
  );
}

/**
 * Gets the platform logo based on the platform name.
 * @param {string} platformName - The name of the streaming platform.
 * @returns {string} - The URL of the platform's logo.
 */
function getPlatformLogo(platformName: string) {
  switch (platformName) {
    case 'netflix':
      return netflixLogo;
    case 'prime':
      return primeLogo;
    case 'disney':
      return disneyLogo;
    case 'peacock':
      return peacockLogo;
    case 'apple':
      return appleLogo;
    case 'hbo':
      return hboLogo;
    case 'hulu':
      return huluLogo;
    case 'paramount':
      return paramountLogo;
    case 'starz':
      return starzLogo;
    case 'showtime':
      return showtimeLogo;
    case 'plutotv':
      return plutotvLogo;
    case 'tubi':
      return tubiLogo;
    default:
      return '';
  }
}
