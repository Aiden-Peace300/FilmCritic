import { DebounceInput } from 'react-debounce-input';
import './ShowDetailsOfSuggestedFilm.css';
// import './RatingComponent.css';
import { useState } from 'react';

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

export default function RatingComponent() {
  const [detailsObj, setDetailsObj] = useState<FilmDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; clicked: boolean }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

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
      console.log(newDetailsObj);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // You should add 'getFilm' as a dependency if you want to call it within this useEffect.
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
            <div className="containerDetails">
              <div className="rowDetails">
                <div className="column-half">
                  <img
                    className="imageDetails"
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
                    <p className="red-text center-mobile inline">
                      RELEASE YEAR:
                    </p>
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
                    <textarea className="note"></textarea>
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
