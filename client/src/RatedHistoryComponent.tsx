import { useState, useEffect } from 'react';

type RatedFilm = {
  idImdb: string;
  userNote: string;
};

type FilmTitleAndPoster = {
  title: string;
  filmPosters: string;
};

export default function RatedHistoryComponent() {
  const [ratedFilms, setRatedFilms] = useState<
    (RatedFilm & FilmTitleAndPoster)[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/idImdb/ratedFilms', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          console.error('Network response was not ok');
          return;
        }

        const data = await response.json();
        console.log('rated history:', data);

        const ratedFilmData = await Promise.all(
          data.map(async (film) => {
            const filmData = await fetchFilmPosterAndTitle(film.idImdb);
            return { ...film, ...filmData };
          })
        );

        setRatedFilms(ratedFilmData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  async function fetchFilmPosterAndTitle(
    id: string
  ): Promise<FilmTitleAndPoster | null> {
    try {
      // Your existing code for fetching film data
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];

      const key = keyParts.join('');

      const response = await fetch(
        `https://imdb-api.com/en/API/Title/${key}/${id}/Trailer,Ratings,`
      );

      console.log('IMDB API IN fetchFilmPosterAndTitle');

      if (response.status === 404) {
        console.error('Resource not found (404)');
        return null; // Return null if no data is found
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return null; // Return null if there's an error
      }

      const responseData = await response.json();

      const filmTitleAndPoster: FilmTitleAndPoster = {
        title: responseData.title,
        filmPosters: responseData.image,
      };

      return filmTitleAndPoster;
    } catch (error) {
      console.error('Error:', error);
      return null; // Return null in case of an error
    }
  }

  return (
    <div>
      <h2>Rated History:</h2>
      <ul>
        {ratedFilms.map((film) => (
          <li key={film.idImdb}>
            ID: {film.idImdb}, User Note: {film.userNote}
            {film.filmPosters !== null && (
              <div>
                <h3>Title: {film.title}</h3>
                <img
                  src={film.filmPosters || ''}
                  alt={`Film Poster for ${film.idImdb}`}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
