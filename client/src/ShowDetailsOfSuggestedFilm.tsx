import './ShowDetailsOfSuggestedFilm.css';
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
          <h1>{detailsObj.film}</h1>
          <img
            src={detailsObj.poster}
            alt={`${detailsObj.film} />                                                            `}
          />
          <p>Release Year: {detailsObj.releaseYear}</p>
          <p>Creator: {detailsObj.creator}</p>
          <p>Description: {detailsObj.description}</p>
          <iframe
            title="Trailer"
            width="560"
            height="315"
            src={detailsObj.trailer}
            frameBorder="0"
            allowFullScreen></iframe>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
