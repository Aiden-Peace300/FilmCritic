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

type FilmDetails = {
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  description: string;
  trailer: string;
  type: string;
  rating: string;
};

export default function ShowDetailsOfSuggestedFilm() {
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]); // State to store platform names

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
        nameOfFilm = extractParameterFromCurrentUrl();
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
        console.log(responseData.result.streamingInfo.us);

        // Extract platform names and set them in state
        const platformArray = responseData.result.streamingInfo.us.map(
          (streamingPlatform: any) => streamingPlatform.service
        );
        setPlatforms(platformArray);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    async function fetchFilmDetails(id: string) {
      const key = 'k_8d6605rp';

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
  }, [getStreamingPlatforms]);

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
              <button className="add-watchlist-button center">
                ADD TO WATCHLIST
              </button>
            </div>
            <p className="red-text pad">STREAMING: </p>
            {platforms.includes('netflix') && (
              <img className="netflix-size" src={netflixLogo} />
            )}
            {platforms.includes('prime') && (
              <img className="prime-size" src={primeLogo} />
            )}
            {platforms.includes('disney') && (
              <img className="disney-size" src={disneyLogo} />
            )}
            {platforms.includes('peacock') && (
              <img className="peacock-size" src={peacockLogo} />
            )}
            {platforms.includes('apple') && (
              <img className="apple-size" src={appleLogo} />
            )}
            {platforms.includes('hbo') && (
              <img className="hbo-size" src={hboLogo} />
            )}
            {platforms.includes('hulu') && (
              <img className="hulu-size" src={huluLogo} />
            )}
            {platforms.includes('paramount') && (
              <img className="paramount-size" src={paramountLogo} />
            )}
            {platforms.includes('starz') && (
              <img className="starz-size" src={starzLogo} />
            )}
            {platforms.includes('showtime') && (
              <img className="showtime-size" src={showtimeLogo} />
            )}
            <p className="red-text pad">REFERRAL LINKS: </p>
            <p className="white-text pad space-below">
              Help us grow and support our website by using our referral link.
              It's like giving our website a high-five and saying, 'Keep up the
              good work!'
            </p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
