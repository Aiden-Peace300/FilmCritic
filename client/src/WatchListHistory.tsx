import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsTrash3 } from 'react-icons/bs';
import DeleteConfirmationPopup from './WatchlistDeletePopup';
import './WatchListHistory.css';

interface FilmPoster {
  [idImdb: string]: string | null;
}

/**
 * Component for displaying the user's watchlist history.
 */
export default function WatchListHistoryComponent() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filmPosters, setFilmPosters] = useState<FilmPoster>({});
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedIdImdb, setSelectedIdImdb] = useState<string | null>(null);

  // Function to show the popup
  const showPopup = (idImdb: string) => {
    setSelectedIdImdb(idImdb); // Set the selected ID when showing the popup
    setPopupVisible(true);
  };

  // Function to hide the popup
  const hidePopup = () => {
    setSelectedIdImdb(null); // Clear the selected ID when hiding the popup
    setPopupVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/watchlist', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const { idImdbList } = data;
        setWatchlist(idImdbList);

        // Fetch film posters for each idImdb and store in state
        const posterPromises = idImdbList.map(async (idImdb) => {
          const poster = await fetchFilmPoster(idImdb);
          return { [idImdb]: poster };
        });

        const posters = await Promise.all(posterPromises);
        setFilmPosters(Object.assign({}, ...posters));
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchData();
  }, []);

  /**
   * Fetches the film poster for a given idImdb.
   * @param {string} id - The idImdb of the film.
   * @returns {Promise<string | null>} - A promise that resolves to the film poster URL or null if not found.
   */
  async function fetchFilmPoster(id: string): Promise<string | null> {
    try {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');

      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
      );

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return null; // Return null if no poster is found
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return null; // Return null if there's an error
      }

      const responseData = await response.json();

      const filmPoster = responseData.image;
      return filmPoster;
    } catch (error) {
      console.error('Error:', error);
      return null; // Return null in case of an error
    }
  }

  return (
    <>
      <div>
        <h2 className="watchlist-prompt mobile-top-margin">
          Watchlist History:
        </h2>
        <p className="watchlist-prompt">
          Click the Film Poster or Details for a reminder of details
        </p>
        <ul className="ul">
          <div className="row center-img">
            {watchlist
              .slice()
              .reverse()
              .map((idImdb) => (
                <li className="li-Profile" key={idImdb}>
                  {filmPosters[idImdb] !== null ? (
                    <div className="row">
                      <div className="column-profile">
                        <img
                          className="profile-image"
                          onClick={() =>
                            navigate(`/movieApp/recommendation/${idImdb}`)
                          }
                          src={filmPosters[idImdb] || ''}
                          alt={`Film Poster for ${idImdb}`}
                        />
                        <button
                          className="details-button"
                          onClick={() =>
                            navigate(`/movieApp/recommendation/${idImdb}`)
                          }>
                          Detail
                        </button>
                        <BsTrash3
                          className="trash-icon"
                          onClick={() => showPopup(idImdb)}
                        />
                      </div>
                    </div>
                  ) : (
                    <p>No poster available</p>
                  )}
                </li>
              ))}
          </div>
        </ul>
      </div>
      {isPopupVisible && (
        <DeleteConfirmationPopup onClose={hidePopup} idImdb={selectedIdImdb} />
      )}
    </>
  );
}
