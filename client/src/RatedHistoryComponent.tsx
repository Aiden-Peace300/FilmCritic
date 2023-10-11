import { useState, useEffect } from 'react';

type RatedFilm = {
  idImdb: string;
  userNote: string;
};

export default function RatedHistoryComponent() {
  const [ratedFilms, setRatedFilms] = useState<RatedFilm[]>([]);

  useEffect(() => {
    const fetchRatedFilms = async () => {
      try {
        const response = await fetch('/api/idImdb/ratedFilms', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('rated history:', data);
        setRatedFilms(data);
      } catch (error) {
        console.error('Error fetching rated films:', error);
      }
    };

    fetchRatedFilms();
  }, []);

  return (
    <>
      <h2>Rated History:</h2>
      <ul>
        {ratedFilms.map((film) => (
          <li key={film.idImdb}>
            ID: {film.idImdb}, User Note: {film.userNote}
          </li>
        ))}
      </ul>
    </>
  );
}
