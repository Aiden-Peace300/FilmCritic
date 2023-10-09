import { DebounceInput } from 'react-debounce-input';
import './ShowDetailsOfSuggestedFilm.css';
import './RatingComponent.css';
import { useState, useCallback } from 'react';
import StarRating from './StarRating';

type FilmDetails = {
  idImdb: string;
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

export default function RatingComponent() {
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; clicked: boolean }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [rating, setRating] = useState(0); // Initialize with a default value
  const [note, setNote] = useState('');

  const handleRatingChange = (newRating: number) => {
    setRating(newRating); // Update the 'rating' state when a star is clicked
  };

  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        const idImdb = detailsObj.idImdb;

        // // Extract idImdb from the URL
        // const { idImdb } = detailsObj;
        console.log(idImdb);

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        console.log(
          'Adding movie to films table and RatedFilms:',
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

        const responseRatedFilms = await fetch('/api/rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({ idImdb, rating, userNote: note }),
        });

        if (responseFilms.status === 201) {
          // Movie added to films table successfully
          console.log('Movie added to films table');
        } else if (responseFilms.status === 200) {
          // Movie is already in the films table
          console.log('Movie already in films table');
        } else {
          // Handle other response statuses (e.g., error)
          console.error('Failed to add movie to films table');
        }

        if (responseRatedFilms.status === 201) {
          // Movie added to watchlist successfully
          console.log('Movie added to watchlist');
        } else if (responseRatedFilms.status === 200) {
          // Movie is already in the watchlist
          console.log('Movie already in watchlist');
        } else {
          // Handle other response statuses (e.g., error)
          console.error('Failed to add movie to watchlist');
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
      }
    },
    [rating, note]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchTerm(input);

    // Fetch suggestions from IMDb API based on the user's input
    fetchSuggestions(input);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Start searching:', searchTerm);
  };

  const handleSuggestionClick = async (suggestion: {
    id: string;
    title: string;
  }) => {
    // Handle when a suggestion is clicked, e.g., populate the input field with the suggestion
    setSearchTerm(suggestion.title);

    // Disable the clicked suggestion
    setSuggestions((prevSuggestions) =>
      prevSuggestions.map((prevSuggestion) =>
        prevSuggestion.id === suggestion.id
          ? { ...prevSuggestion, clicked: true }
          : prevSuggestion
      )
    );
    setShowSuggestions(false);
    console.log('Clicked suggestion:', suggestion.title);
    getFilm(suggestion.id);
  };

  const fetchSuggestions = async (input: string) => {
    try {
      const url = `https://imdb-api.com/en/API/SearchSeries/k_8d6605rp/${input}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key':
            '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',
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      });

      if (!response.ok) throw new Error(`Fetch Error ${response.status}`);

      const responseData = await response.json();
      const suggestionData = responseData.results || [];
      const limitedSuggestions = suggestionData.slice(0, 7);

      const suggestionsWithClickStatus = limitedSuggestions.map(
        (suggestion) => ({
          ...suggestion,
          clicked: false,
        })
      );

      setSuggestions(suggestionsWithClickStatus);
      setShowSuggestions(true);
    } catch (err) {
      console.error(err);
    }
  };

  async function getFilm(id: string) {
    // call api for film title, release year, and creator
    console.log(id);
    fetchFilmDetails(id);
  }

  async function fetchFilmDetails(id: string) {
    const key = 'k_8d6605rp';

    try {
      setLoading(true);
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

      const newDetailsObj: FilmDetails = {
        idImdb: responseData.id ?? '',
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
      console.log(newDetailsObj);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>RATING</h1>
      <form onSubmit={handleSearchSubmit}>
        <div className="row">
          <div className="column">
            <DebounceInput
              minLength={3}
              debounceTimeout={800}
              className="searchBar"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="row">
          <div className="column">
            <ul className="searchSuggestions">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className={suggestion.clicked ? 'disabled' : ''}>
                  <button
                    className="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={suggestion.clicked}>
                    {suggestion.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        detailsObj && (
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
                      <StarRating onRatingChange={handleRatingChange} />
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => addToFilmsTableAndWatchlist(detailsObj)}
                      className="ratedFilm">
                      POST
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
