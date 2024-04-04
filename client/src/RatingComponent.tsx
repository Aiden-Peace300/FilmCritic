import { DebounceInput } from 'react-debounce-input';
import './ShowDetailsOfSuggestedFilm.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilmBanner from './FilmBanner';
import Footer from './Footer';

/**
 * RatingComponent allows users to search for a show to rate and provides suggestions based on user input.
 * @returns {JSX.Element} The RatingComponent JSX element.
 */
export default function RatingComponent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; clicked: boolean }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

  /**
   * handleSearchChange is called when the search input value changes.
   * It updates the search term and fetches suggestions from the IMDb API.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    console.log('Input:', input);
    setSearchTerm(input);

    // Fetch suggestions from IMDb API based on the user's input
    fetchSuggestions(input);
  };

  /**
   * handleSearchSubmit is called when the search form is submitted.
   * It logs the start of the search.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Start searching:', searchTerm);
  };

  /**
   * handleSuggestionClick is called when a suggestion is clicked.
   * It populates the input field with the suggestion and triggers fetching film details.
   * @param {Object} suggestion - The clicked suggestion with id and title.
   */
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

  /**
   * fetchSuggestions is an asynchronous function that fetches film suggestions from the IMDb API.
   * It updates the state with the fetched suggestions.
   * @param {string} input - The user's input for searching films.
   */
  const fetchSuggestions = async (input: string) => {
    try {
      console.log('fetchSuggestions Input', input);
      const url = `https://tv-api.com/en/API/SearchSeries/k_ei6ruv0h/${input}`;

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

  /**
   * getFilm is called when a suggestion is clicked to get film details.
   * @param {string} id - The IMDb ID of the selected film.
   */
  async function getFilm(id: string) {
    // call api for film title, release year, and creator
    console.log(id);
    fetchFilmDetails(id);
  }

  /**
   * fetchFilmDetails is an asynchronous function that fetches film details from the IMDb API based on the IMDb ID.
   * It updates the state with the film details and navigates to the film's page.
   * @param {string} id - The IMDb ID of the film to fetch details for.
   */
  async function fetchFilmDetails(id: string) {
    const key = 'k_ei6ruv0h';

    try {
      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
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

      navigate(`${responseData.id}`);
      console.log('responseData.id', responseData.id);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <>
      {/* <h1 style={{ marginBottom: '0rem' }}>RATING</h1> */}
      <h2 style={{ color: 'white', marginBottom: '.5rem', marginLeft: '2rem' }}>
        TYPE IN A SHOW THAT YOU WOULD LIKE TO RATE:{' '}
      </h2>
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
                  id="li"
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
      <FilmBanner />
      <Footer />
    </>
  );
}
