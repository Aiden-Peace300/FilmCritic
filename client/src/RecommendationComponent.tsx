import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';
import './RecommendationComponent.css';
import { useRecommendations } from './useRecommendations';

export function RecommendationComponent() {
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; clicked: boolean }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

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

  const apiCache = new Map();

  async function fetchDataWithCache(url, key) {
    if (apiCache.has(key)) {
      return apiCache.get(key);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fetch Error ${response.status}`);
      }
      const responseData = await response.json();

      apiCache.set(key, responseData);

      return responseData;
    } catch (err) {
      console.error(err);
    }
  }

  async function findShowInIMDB(nameOfFilm) {
    const key = 'k_8d6605rp';

    try {
      const url = `https://imdb-api.com/en/API/SearchSeries/${key}/${nameOfFilm}`;
      const responseData = await fetchDataWithCache(url, nameOfFilm);

      if (responseData) {
        const firstResult = responseData.results[0];
        console.log('Found show:', firstResult.title, 'imdbId', firstResult.id);
        return getImageOfRecommendation(firstResult.id);
      } else {
        console.log('No results found for:', nameOfFilm);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function getImageOfRecommendation(idImdb) {
    const key = 'k_8d6605rp';
    try {
      const url = `https://imdb-api.com/en/API/Title/${key}/${idImdb}/Images,Trailer,`;
      const responseData = await fetchDataWithCache(url, idImdb);

      if (responseData && responseData.image && responseData.image.length > 0) {
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

  const handleSuggestionClick = async (suggestion: {
    id: string;
    title: string;
  }) => {
    setSearchTerm(suggestion.title);
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
        'Ic5lnwzT8',
        'EMNOumCW',
        'iO4T3Blbk',
        'FJ7T0AsD0',
        'mZ1ILQK',
        'IHPgZP',
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

  async function getRecommendations(filmFromUser) {
    const suggestion = await suggestionFromAI(
      `GIVE ME A LIST OF 5 FILMS THAT WOULD CLOSELY RESEMBLE THIS FILM (ONLY THE NAMES OF THE FILMS, NO OTHER PROMPTS WITH NO NUMBERING): ${filmFromUser}?`
    );

    const showStrings = breakShowsIntoStrings(suggestion);

    console.log(showStrings);

    const showImagesArray: string[] = [];
    const showTitleArray: string[] = [];
    const showImdbIdArray: any[] = [];

    for (const showName of showStrings) {
      const cleanShowName = showName
        .trim()
        .replace(/\d+/g, '')
        .replace(/-/g, '');

      if (cleanShowName.length !== 0) {
        console.log('Suggestion From AI:', cleanShowName);
        const imageUrl = await findShowInIMDB(cleanShowName);
        const title = await findShowTitleInIMDB(cleanShowName);
        const details = await handleFilmDetails(cleanShowName);
        console.log(imageUrl);
        console.log(title);
        if (imageUrl !== undefined) {
          showImagesArray.push(imageUrl);
        }
        showTitleArray.push(title);
        showImdbIdArray.push(details);

        console.log('Show Images:', showImagesArray);
        console.log("Show Id's", showImdbIdArray);
      }
    }

    setShowImages(showImagesArray);
    setShowTitle(showTitleArray);
    setShowId(showImdbIdArray);
  }

  function breakShowsIntoStrings(showsList) {
    const showStrings = showsList.split('. ');
    const filteredShowStrings = showStrings.filter((str) => str.trim() !== '');

    return filteredShowStrings;
  }

  async function findShowTitleInIMDB(nameOfFilm) {
    const key = 'k_8d6605rp';

    try {
      const url = `https://imdb-api.com/en/API/SearchSeries/${key}/${nameOfFilm}`;
      const response = await fetch(url);

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return;
      }

      const responseData = await response.json();

      if (responseData.results && responseData.results.length > 0) {
        const titleofFilm = responseData.results[0].title;
        console.log('Found show:', titleofFilm);
        return titleofFilm;
      } else {
        console.log('No results found for:', nameOfFilm);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleFilmDetails(title) {
    const key = 'k_8d6605rp';

    try {
      const url = `https://imdb-api.com/en/API/SearchSeries/${key}/${title}`;
      const response = await fetch(url);

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return;
      }

      const responseData = await response.json();

      if (responseData.results && responseData.results.length > 0) {
        const firstResult = responseData.results[0];
        console.log(
          'Found show:',
          firstResult.title,
          'Found id',
          firstResult.id
        );
        return firstResult.id;
      } else {
        console.log('No results found for:', title);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const fetchSuggestions = async (input) => {
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

  return (
    <div>
      <h1>RECOMMENDATION</h1>
      <form onSubmit={handleSearchSubmit}>
        <div className="row">
          <div className="column">
            <DebounceInput
              minLength={3}
              debounceTimeout={1000}
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
      <div className="row">
        {showImages.map((imageSrc, index) => (
          <div className="columnSug margin-top" key={index}>
            <div>
              <Link to={`${showId[index]}`}>
                <img className="image" src={imageSrc} alt={showTitle[index]} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
