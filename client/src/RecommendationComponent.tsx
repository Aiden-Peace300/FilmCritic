import { useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import './RecommendationComponent.css';

export function RecommendationComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string }[]
  >([]);
  const apiKey = '1d8984c313msh20ce3032c3ab337p129762jsnad07952e57f1';

  const handleSearchChange = (e: any) => {
    const input = e.target.value;
    setSearchTerm(input);

    // Fetch suggestions from IMDb API based on the user's input
    fetchSuggestions(input);
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    console.log('Start searching:', searchTerm);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle when a suggestion is clicked, e.g., populate the input field with the suggestion
    setSearchTerm(suggestion);
    setSuggestions([]); // Clear suggestions
  };

  const fetchSuggestions = async (input) => {
    try {
      const url = `https://imdb-api.com/en/API/SearchSeries/k_8d6605rp/${input}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      });

      if (!response.ok) throw new Error(`Fetch Error ${response.status}`);

      const responseData = await response.json();
      const suggestionData = responseData.results || [];

      // Update the suggestions state with the retrieved data
      setSuggestions(suggestionData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>RECOMMENDATION</h1>
      <form onSubmit={handleSearchSubmit}>
        <div className="row">
          <div className="column">
            <DebounceInput
              minLength={1}
              debounceTimeout={20}
              className="searchBar"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="row">
          <div className="column">
            <ul className="searchSuggestions">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.title)}>
                  {suggestion.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
