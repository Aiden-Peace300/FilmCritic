import './ShowDetailsOfSuggestedFilm.css';
import { useState, useEffect } from 'react';

type FilmDetails = {
  poster: string;
  film: string;
  releaseYear: string;
  creator: string;
  description: string;
  trailer: string;
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
          poster: responseData.image,
          film: responseData.title,
          releaseYear: responseData.year,
          creator: responseData.tvSeriesInfo.creators,
          description: responseData.plot,
          trailer: responseData.trailer.linkEmbed,
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
          <img
            className="image"
            src={detailsObj.poster}
            alt={`${detailsObj.film}`}
          />
          <div className="center">
            <p className="red-text center inline">FILM: </p>
            <p className="white-text center inline">{detailsObj.film}</p>
            <br />
            <p className="red-text center inline">RELEASE YEAR: </p>
            <p className="white-text center inline">{detailsObj.releaseYear}</p>
            <br />
            <p className="red-text center inline">CREATOR: </p>
            <p className="white-text center inline">{detailsObj.creator}</p>
          </div>
          <br />
          <p className="red-text pad">DESCRIPTION: </p>
          <p className="white-text pad">{detailsObj.description}</p>
          <iframe
            className="trailer"
            title="Trailer"
            src={detailsObj.trailer}
            frameBorder="0"
            allowFullScreen></iframe>
          <p className="red-text pad">ADD TO WATCHLIST:</p>
          <div className="center">
            <button className="button">ADD TO WATCHLIST</button>
          </div>
          <p className="red-text pad">REFERRAL LINKS: </p>
          <p className="white-text pad">
            Help us grow and support our website by using our referral link.
            It's like giving our website a high-five and saying, 'Keep up the
            good work!'
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
