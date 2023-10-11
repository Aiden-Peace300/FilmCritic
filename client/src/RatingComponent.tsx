import { DebounceInput } from 'react-debounce-input';
// import './ShowDetailsOfSuggestedFilm.css';
// import './RecommendationComponent.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; clicked: boolean }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    console.log('Input:', input);
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

    console.log(showSuggestions);
    setShowSuggestions(false);
    console.log('Clicked suggestion:', suggestion.title);
    getFilm(suggestion.id);
  };

  const fetchSuggestions = async (input: string) => {
    try {
      console.log('fetchSuggestions Input', input);
      const url = `https://imdb-api.com/en/API/SearchSeries/k_ei6ruv0h/${input}`;

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

      if (!response.ok) console.error(`Fetch Error ${response.status}`);

      const responseData = await response.json();
      console.log('response:', response);
      const suggestionData = responseData.results || [];
      const limitedSuggestions = suggestionData.slice(0, 7);

      console.log('suggestionData:', suggestionData);
      console.log('limitedSuggestions:', limitedSuggestions);

      const suggestionsWithClickStatus = limitedSuggestions.map(
        (suggestion) => ({
          ...suggestion,
          clicked: false,
        })
      );

      console.log('suggestionData After:', suggestionData);
      console.log('limitedSuggestions After:', limitedSuggestions);

      console.log('Mapped Suggestions:', suggestionsWithClickStatus);

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

      const newDetailsObj: FilmDetails = {
        idImdb: responseData.id ?? '',
        poster: responseData.image ?? '',
        film: responseData.title ?? '',
        releaseYear: responseData.year ?? '',
        creator:
          (responseData.tvSeriesInfo?.creators || responseData.writers) ?? '',
        description: responseData.plot ?? '',
        trailer: responseData.trailer?.linkEmbed ?? '',
        type: responseData.ratings?.type ?? '',
        rating: responseData.ratings?.imDb ?? '',
        genre: responseData.genres ?? '',
      };

      navigate(`${newDetailsObj.idImdb}`, { state: newDetailsObj });
      console.log('newDetailsObj', newDetailsObj);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <>
      <h1>RATING</h1>
      <p className="disclamer-Msg">
        DISCLAIMER: PLEASE ALLOW A FEW SECONDS FOR THE SEARCH BAR; WE ARE
        LOOKING THROUGH THOUSANDS OF FILMS TO FIND THE PERFECT ONE FOR YOU.
        PLEASE BE PATIENCE WITH US
      </p>
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
    </>
  );
}
