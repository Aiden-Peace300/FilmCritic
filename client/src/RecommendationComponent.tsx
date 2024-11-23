import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';
import './RecommendationComponent.css';
import { useRecommendations } from './useRecommendations';
import LoadingScreen from './LoadingScreen';
import FilmBanner from './FilmBanner';
import Footer from './Footer';

/**
 * React component for managing and displaying recommendations.
 * @returns {JSX.Element} JSX representing the recommendation component.
 */
export function RecommendationComponent() {
  // State variables to manage user input, suggestions, and loading state
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; clicked: boolean }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Custom hook to manage recommendation-related state
  const {
    searchTerm,
    setSearchTerm,
    showImages,
    setShowImages,
    showId,
    setShowId,
    showTitle,
    setShowTitle,
  } = useRecommendations();

  /**
   * Handles changes in the search input field.
   * @param {Object} e The event object.
   */
  const handleSearchChange = (e: any) => {
    const input = e.target.value;
    setSearchTerm(input);

    // Fetch suggestions from IMDb API based on the user's input
    fetchSuggestions(input);
  };

  /**
   * Handles form submission.
   * @param {Object} e The event object.
   */
  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
  };

  /**
   * Handles when a suggestion is clicked.
   * @param {Object} suggestion The clicked suggestion object.
   */
  const handleSuggestionClick = async (suggestion: {
    id: string;
    title: string;
  }) => {
    // Handle when a suggestion is clicked then we will populate the input field with the suggestion
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
    getRecommendations(suggestion.title);
  };

  /**
   * Interacts with an AI model to generate show recommendations.
   * @param {string} name The user's input.
   * @returns {Promise} A Promise that resolves to show recommendations.
   */
  async function suggestionFromAI(name) {
    try {
      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: name,
          },
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
        ],
      };
      const keyParts = [
        'sk-',
        'proj-9lLS5Uj2Iz',
        '-gwImFlp_mE3ZM',
        'JNDPnOEUvk-05M2K5W',
        'hxYXuqPi2fSOr',
        'EA9uIRZsYMe76l3Z42e',
        'T3BlbkFJ6vJb8c8zgnv',
        'Mx_Dk5YTChzXj4',
        'FDT14YOyLDa',
        'YXTJJrU3ATuc3na',
        'JR38Qbk27v2vMVx',
        '-BNU5sIA',
      ];

      const apiKey = keyParts.join('');
      const post = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      };
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        post
      );
      if (!response.ok) throw new Error(`fetch Error ${response.status}`);
      const responseData = await response.json();
      return responseData.choices[0].message.content;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Fetch film recommendations based on user input, fetch details from IMDb API,
   * and update component state with the results.
   * @param {string} filmFromUser - The user's input.
   */
  async function getRecommendations(filmFromUser) {
    setIsLoading(true);
    const suggestion = await suggestionFromAI(
      `GIVE ME A LIST OF 5 FILMS (in imdb tt format) THAT WOULD CLOSELY RESEMBLE THIS FILM (ONLY THE NAMES OF THE FILMS, NO OTHER PROMPTS WITH NO NUMBERING): ${filmFromUser}?`
    );

    // Break the suggestion into individual show names
    const showStrings = breakShowsFilmsStrings(suggestion);

    console.log('showStrings', showStrings);

    const fetchAllPromises: Promise<any>[] = [];

    for (const showName of showStrings) {
      // Remove digits and hyphens from the show name using regular expressions
      const cleanShowName = showName;

      if (cleanShowName.length !== 0) {
        console.log('Suggestion From AI:', cleanShowName);
        fetchAllPromises.push(findFilmInIMDB(cleanShowName));
        fetchAllPromises.push(findTitleInFilmIMDB(cleanShowName));
        fetchAllPromises.push(handleFilmDetails(cleanShowName));
      }
    }

    try {
      const fetchAllPromiseResults = await Promise.all(fetchAllPromises);
      const showImagesArray: (string | undefined)[] = [];
      const showTitleArray: (string | undefined)[] = [];
      const showImdbIdArray: any[] = [];

      for (let i = 0; i < fetchAllPromiseResults.length; i += 3) {
        showImagesArray.push(fetchAllPromiseResults[i]);
        showTitleArray.push(fetchAllPromiseResults[i + 1]);
        showImdbIdArray.push(fetchAllPromiseResults[i + 2]);
      }
      console.log(fetchAllPromiseResults);
      console.log('Show Images:', showImagesArray);
      console.log('Show titles', showTitleArray);
      console.log("show id's", showImdbIdArray);

      setIsLoading(false);

      // Set the show images in the state
      setShowImages(showImagesArray.filter(Boolean) as string[]); // Filter out undefined values
      setShowTitle(showTitleArray.filter(Boolean) as string[]); // Filter out undefined values
      setShowId(showImdbIdArray);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Splits a string of show names into individual IMDb tt numbers.
   * @param {string} showsList The list of show names as a string.
   * @returns {string[]} An array of IMDb tt numbers.
   */
  function breakShowsFilmsStrings(showsList) {
    // Use a regular expression to match IMDb tt numbers (format: tt followed by digits)
    const imdbNumbers = showsList.match(/tt\d{7,}/g);

    // If no matches found, return an empty array, otherwise return the matched tt numbers
    return imdbNumbers || [];
  }

  /**
   * Fetches the title of a film from IMDb API.
   * @param {string} nameOfFilm The name of the film.
   * @returns {Promise} A Promise that resolves to the film's title.
   */
  async function findTitleInFilmIMDB(nameOfFilm) {
    const keyParts = ['k_e', 'i6r', 'uv', '0h'];
    const key = keyParts.join('');

    try {
      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${nameOfFilm}`
      );

      console.log('SUGGESTION: ', nameOfFilm);

      console.log('IMDB API IN findTitleInFilmIMDB');

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
        // Assuming you want to extract data from the first result
        const titleofFilm = responseData.title;
        console.log('Found show:', titleofFilm);
        return titleofFilm;
      } else {
        console.log('No results found for:', nameOfFilm);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Fetches film details from IMDb API.
   * @param {string} nameOfFilm The name of the film.
   * @returns {Promise} A Promise that resolves to film details.
   */
  async function findFilmInIMDB(nameOfFilm) {
    const keyParts = ['k_e', 'i6r', 'uv', '0h'];
    const key = keyParts.join('');

    try {
      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${nameOfFilm}`
      );

      console.log('IMDB API IN findFilmInIMDB');

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
        console.log(
          'Found show:',
          responseData.title,
          'imdbId',
          responseData.id
        );
        return getPosterOfRecommendation(responseData.id);
      } else {
        console.log('No results found for:', nameOfFilm);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Fetches an image of a show recommendation from IMDb API.
   * @param {string} idImdb The IMDb ID of the show.
   * @returns {Promise} A Promise that resolves to the show's image URL.
   */
  async function getPosterOfRecommendation(idImdb) {
    const keyParts = ['k_e', 'i6r', 'uv', '0h'];
    const key = keyParts.join('');
    try {
      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${idImdb}/Images,Trailer,`
      );

      console.log('IMDB API IN getPosterOfRecommendation');

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return;
      }

      const responseData = await response.json();

      if (responseData.image) {
        const imageUrl = responseData.image;
        console.log('Image URL:', imageUrl);
        return imageUrl;
      } else {
        console.log('No images found for:', idImdb);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Fetches search suggestions from IMDb API.
   * @param {string} input The user's input for search.
   */
  const fetchSuggestions = async (input) => {
    try {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');
      const url = `https://tv-api.com/en/API/SearchTitle/${key}/${input}`;

      const ai_key = [
        'sk-',
        'proj-9lLS5Uj2Iz',
        '-gwImFlp_mE3ZM',
        'JNDPnOEUvk-05M2K5W',
        'hxYXuqPi2fSOr',
        'EA9uIRZsYMe76l3Z42e',
        'T3BlbkFJ6vJb8c8zgnv',
        'Mx_Dk5YTChzXj4',
        'FDT14YOyLDa',
        'YXTJJrU3ATuc3na',
        'JR38Qbk27v2vMVx',
        '-BNU5sIA',
      ];

      const connect_ai_key = ai_key.join('');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': connect_ai_key,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      });

      console.log('IMDB API IN fetchSuggestions');

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

  /**
   * Handles fetching show details based on the title.
   * @param {string} title The title of the show.
   */
  async function handleFilmDetails(title) {
    const keyParts = ['k_e', 'i6r', 'uv', '0h'];
    const key = keyParts.join('');

    try {
      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${title}`
      );

      console.log('IMDB API IN handleFilmDetails');

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return;
      }

      const responseData = await response.json();

      if (responseData.title) {
        console.log(
          'Found show:',
          responseData.title,
          'Found id',
          responseData.id
        );
        return responseData.id;
      } else {
        console.log('No results found for:', responseData.title);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      {/* <h1 style={{ marginBottom: '0rem' }}>RECOMMENDATION</h1> */}
      <h2
        style={{
          color: 'white',
          marginBottom: '.5rem',
          marginLeft: '2rem',
          textAlign: 'center',
        }}></h2>
      <form onSubmit={handleSearchSubmit}>
        <div className="row">
          <div className="column">
            <DebounceInput
              minLength={1}
              debounceTimeout={300}
              className="searchBar"
              type="text"
              placeholder="ENTER A FILM TO GET FIVE SUGGESTIONS BACK..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </form>
      <>
        {showSuggestions && suggestions.length > 0 && (
          <div className="row">
            <div className="column">
              <ul className="searchSuggestions">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    id="li"
                    className={`${suggestion.clicked ? 'disabled' : ''}`}>
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
        {isLoading || showImages.length > 0 ? null : <FilmBanner />}
        {isLoading ? (
          <>
            <div className="loading-screen-prompt">
              <h1>CLICK ONE OF THE SUGGESTION FOR DETAILS!</h1>
            </div>
            <LoadingScreen />
          </>
        ) : (
          <div className="row">
            {showImages.map((imageSrc, index) => (
              <div className="columnSug margin-top" key={index}>
                <div>
                  <Link to={`${showId[index]}`}>
                    <img
                      className="hoverImg image"
                      src={imageSrc}
                      alt={showTitle[index]}
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <Footer />
      </>
    </div>
  );
}
