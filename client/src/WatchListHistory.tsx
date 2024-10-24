import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsTrash3 } from 'react-icons/bs';
import DeleteConfirmationPopup from './WatchlistDeletePopup';
import './WatchListHistory.css';

interface FilmData {
  poster: string | null;
  title: string;
  rating: string;
}

/**
 * Component for displaying the user's watchlist history.
 */
export default function WatchListHistoryComponent() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filmData, setFilmData] = useState<{ [idImdb: string]: FilmData }>({});
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

        // Fetch film data (poster and title) for each idImdb and store in state
        const filmDataPromises = idImdbList.map(async (idImdb) => {
          const filmInfo = await fetchFilmData(idImdb);
          return { [idImdb]: filmInfo };
        });

        const filmDataArray = await Promise.all(filmDataPromises);
        setFilmData(Object.assign({}, ...filmDataArray));
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchData();
  }, []);

  /**
   * Fetches the film poster and title for a given idImdb.
   * @param {string} id - The idImdb of the film.
   * @returns {Promise<FilmData>} - A promise that resolves to the film poster URL and title.
   */
  async function fetchFilmData(id: string): Promise<FilmData> {
    try {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');

      const response = await fetch(
        `https://tv-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
      );

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return { poster: null, title: 'Unknown Title' }; // Handle missing resource
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return { poster: null, title: 'Unknown Title' }; // Handle error
      }

      const responseData = await response.json();

      const filmPoster = responseData.image || null;
      const filmTitle = responseData.title || 'Unknown Title';
      const filmRating = responseData.ratings.imDb || 'Unknown Rating';

      return { poster: filmPoster, title: filmTitle, rating: filmRating };
    } catch (error) {
      console.error('Error: ', error);
      return { poster: null, title: 'Unknown Title' }; // Handle fetch error
    }
  }

  return (
    <>
      <div>
        <h2 className="watchlist-prompt mobile-top-margin">
          WATCHLIST HISTORY BELOW
        </h2>
        <ul className="ul">
          <div className="row center-img">
            {watchlist
              .slice()
              .reverse()
              .map((idImdb) => (
                <li className="li-Profile" key={idImdb}>
                  {filmData[idImdb]?.poster ? (
                    <div className="row">
                      <div className="column-profile">
                        <div className="image-container">
                          <img
                            className="profile-image"
                            onClick={() =>
                              navigate(`/movieApp/recommendation/${idImdb}`)
                            }
                            src={filmData[idImdb].poster || ''}
                            alt={`Film Poster for ${filmData[idImdb].title}`}
                          />
                          <div className="middle">
                            <div className="text">{`CLICK FOR '${filmData[
                              idImdb
                            ].title.toUpperCase()}' FILM DETAILS`}</div>
                          </div>
                        </div>
                        <div className="details-button">
                          <div style={{ textAlign: 'left' }}>
                            <div className="title">
                              {filmData[idImdb].title}
                            </div>
                            <div className="rating">
                              {`IMDB RATING: ${filmData[idImdb].rating}`}
                            </div>
                          </div>
                          <BsTrash3
                            className="trash-icon"
                            onClick={() => showPopup(idImdb)}
                          />
                        </div>
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
