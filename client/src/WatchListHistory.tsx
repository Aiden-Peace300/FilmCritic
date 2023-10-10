import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export type PageTypeInsideApp = 'Logout';
import { FaTrash } from 'react-icons/fa';
import './WatchListHistory.css';

interface FilmPoster {
  [idImdb: string]: string | null;
}

export default function ProfileComponent() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filmPosters, setFilmPosters] = useState<FilmPoster>({});

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
        console.log('Watchlist data:', idImdbList); // Debugging line
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

  async function fetchFilmPoster(id: string): Promise<string | null> {
    const key = 'k_8d6605rp';

    try {
      const response = await fetch(
        `https://imdb-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
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
        <h2>Watchlist:</h2>
        <ul className="ul">
          <div className="row">
            {watchlist.map((idImdb) => (
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
                      <FaTrash className="trash-icon" />
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
    </>
  );
}
