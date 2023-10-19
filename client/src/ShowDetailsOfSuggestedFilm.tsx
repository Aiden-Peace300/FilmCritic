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

export default function ShowDetailsOfSuggestedFilm() {
  const navigate = useNavigate();
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [platforms, setPlatforms] = useState<
    Array<{ name: string; link: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const displayedPlatforms = new Set<string>();

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

        console.log('Before adding to films table', idImdb, detailsObj);

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

        console.log('responseWatchlist:', responseWatchlist);

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
          avigate(-1);
        }

        console.log();
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [navigate]
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
    async function fetchFilmDetails(id: string) {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');

      try {
        const response = await fetch(
          `https://imdb-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
        );

        console.log('response: ', response);

        if (response.status === 404) {
          console.error('Resource not found (404)');
          return;
        }

        if (!response.ok) {
          console.error('Failed to fetch data from IMDb API');
          return;
        }

        const responseData = await response.json();

        if (responseData) {
          const newDetailsObj = {
            idImdb: responseData.id ?? '',
            poster: responseData.image ?? '',
            filmTitle: responseData.title ?? '',
            releaseYear: responseData.year ?? '',
            creator:
              (responseData.tvSeriesInfo?.creators || responseData.writers) ??
              '',
            description: responseData.plot ?? '',
            trailer: responseData.trailer?.linkEmbed ?? '',
            type: responseData.ratings.type ?? '',
            generalRating: responseData.ratings.imDb ?? '',
            genre: responseData.genres ?? '',
          };
          setDetailsObj(newDetailsObj);
          getStreamingPlatforms(idImdb);
        } else {
          console.error('responseData is undefined');
        }
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
                  alt={`${detailsObj.filmTitle}`}
                />
              </div>
              <div className="col-half">
                <div className="center-mobile space">
                  <p className="red-text center-mobile inline">FILM: </p>
                  <p className="white-text center-mobile inline">
                    {detailsObj.filmTitle}
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
                  <p className="white-text center-mobile inline">{` ${detailsObj.generalRating} / 10`}</p>
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
              <>
                <p style={{ color: 'white', marginBottom: '2rem' }}>
                  Click to Icon(s) below to start Streaming:{' '}
                </p>
                {platforms.map((platform) => {
                  // Check if the platform name is not already displayed
                  if (!displayedPlatforms.has(platform.name)) {
                    // If not displayed, add it to the set
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
                  return null; // Don't render the platform icon if it's already displayed
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
    </div>
  );
}

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
    default:
      return '';
  }
}
