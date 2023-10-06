import './ShowDetailsOfSuggestedFilm.css';
import { useState, useEffect } from 'react';

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
  function extractParameterFromCurrentUrl() {
    const currentUrl = window.location.href; // Get the current URL
    const regexPattern = /\/tt([0-9]+)/; // Regular expression to match "/tt" followed by numbers

    const match = currentUrl.match(regexPattern);

    if (match && match.length > 1) {
      return match[0].substring(1);
    }
    return null; // Parameter not found
  }

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
          rating: responseData.ratings.metacritic ?? '',
        };

        setDetailsObj(newDetailsObj); // Update the state with film details
      } catch (error) {
        console.error('Error:', error);
      }
    }

    const idImdb = extractParameterFromCurrentUrl();
    if (idImdb) {
      fetchFilmDetails(idImdb);
    }
  }, []); // Empty dependency array means this effect runs once on component mount

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
                  <p className="white-text center-mobile inline">{` ${detailsObj.rating} / 100`}</p>
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
