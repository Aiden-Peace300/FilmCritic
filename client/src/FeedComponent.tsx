import { BsTrash3 } from 'react-icons/bs';
import DeleteConfirmationPopup from './RatedDeletePopup';
// import { FaComment } from 'react-icons/fa';
import { MdOutlineModeEdit } from 'react-icons/md';
import RatedStars from './RatedStars';
import './RatedHistoryComponent.css';
import HeartRating from './HeartLikes';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RatedFilm = {
  idImdb: string;
  userNote: string;
  rating: number;
  userId: number;
  likes: number;
};

type FilmTitleAndPoster = {
  title: string;
  filmPosters: string;
};

export default function FeedComponent() {
  const navigate = useNavigate();
  const [ratedFilms, setRatedFilms] = useState<
    (RatedFilm & FilmTitleAndPoster)[]
  >([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedIdImdb, setSelectedIdImdb] = useState<string | null>(null);
  const [filmLikes, setFilmLikes] = useState<Map<string, number>>(new Map());

  const showPopup = (idImdb: string) => {
    setSelectedIdImdb(idImdb);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setSelectedIdImdb(null);
    setPopupVisible(false);
  };

  const showEditComponent = (idImdb: string) => {
    console.log('Showing Edit Component for idImdb:', idImdb);
    navigate(`profile/${idImdb}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Feed/ratedFilms', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('RATED HISTORY!!!!:', data);

        const localLikes = new Map();

        const ratedFilmData = await Promise.all(
          data.map(async (film) => {
            try {
              console.log('film0', film);
              const filmData = await fetchFilmPosterAndTitle(film.idImdb);
              const likesResponse = await fetchLikesCount(
                film.idImdb,
                film.userId
              );
              console.log('film', film);

              console.log('likesResponse:', likesResponse);

              // Create a copy of the film object with updated 'likes'
              const updatedFilm = {
                ...film,
                ...filmData,
                likes: likesResponse.likes,
              };

              // Update the local likes count
              localLikes.set(film.idImdb, updatedFilm.likes);

              console.log('updatedFilm : ', updatedFilm);
              return updatedFilm;
            } catch (error) {
              console.error('Error fetching film data:', error);
              // Handle the error for this film data here, e.g., set a default value
              return { ...film, poster: '', title: '', likes: 0 };
            }
          })
        );

        setRatedFilms(ratedFilmData);
        setFilmLikes(localLikes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchLikesCount = async (idImdb, userId) => {
    try {
      const response = await fetch(`/api/likes/${idImdb}/${userId}`, {
        method: 'GET',
      });

      console.log('response: ', response);

      if (!response.ok) {
        console.error('Failed to fetch likes count for', idImdb);
        return { likes: 0 }; // Default to 0 if there's an error
      }

      const likesData = await response.json();
      console.log('likesData: ', likesData);
      if (likesData.likes !== undefined) {
        return { likes: likesData.likes }; // Extract the likes count from the API response
      } else {
        return { likes: likesData };
      }
    } catch (error) {
      console.error('Error fetching likes count:', error);
      return { likes: 0 };
    }
  };

  const userId = Number(sessionStorage.getItem('userId'));
  if (!userId) {
    return <div>USER NOT FOUND</div>;
  }

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
        return null;
      }

      if (!response.ok) {
        console.error('Failed to fetch data from IMDb API');
        return null;
      }

      const responseData = await response.json();

      const filmTitleAndPoster: FilmTitleAndPoster = {
        title: responseData.title,
        filmPosters: responseData.image,
      };

      return filmTitleAndPoster;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  const handleUpdateLikes = (idImdb, newLikes, userId) => {
    setRatedFilms((prevFilms) => {
      // Create a copy of the previous state
      const updatedFilms = [...prevFilms];

      // Find the index of the film in the array
      const filmIndex = updatedFilms.findIndex(
        (film) => film.idImdb === idImdb && film.userId === userId
      );

      console.log('idImdb', idImdb);
      console.log('newLikes', newLikes);
      console.log('userId', userId);

      if (filmIndex !== -1) {
        // Update the likes count for the specific film with the newLikes and the correct idImdb
        updatedFilms[filmIndex] = {
          ...updatedFilms[filmIndex],
          likes: newLikes,
          idImdb: idImdb,
          userId: userId,
        };
      }

      return updatedFilms;
    });
  };

  console.log('ratedFilms', ratedFilms);

  return (
    <div>
      <div className="row1">
        {ratedFilms
          .slice()
          .reverse()
          .map((film, index) => (
            <div className="column1" key={index}>
              <div className="row2">
                {film.filmPosters !== null && (
                  <div className="image-container">
                    <img
                      className="RatedHistoryImg"
                      src={film.filmPosters || ''}
                      alt={`Film Poster for ${film.idImdb}`}
                    />
                  </div>
                )}
                <div className="text-details">
                  <p className="rated-title">
                    <span className="red-text">FILM: </span>
                    {film.title.toUpperCase()}
                  </p>
                  <p className="rated-note">{film.userNote}</p>
                  <div className="space1">
                    <span className="like-prompt">Likes: {film.likes}</span>
                    <hr className="line" />
                    <div className="rating-container">
                      <div className="rated-stars-row">
                        <span>{<RatedStars rating={film.rating} />}</span>
                        <span className="ratedRating">{film.rating}/5</span>
                      </div>
                      <div className="vertical-line hidden-prompt"></div>
                      <hr className="line2" />
                      <div className="rated-stars-row">
                        <span className="like-button">
                          <HeartRating
                            idImdb={film.idImdb}
                            initialLikes={filmLikes.get(film.idImdb) || 0}
                            userId={film.userId}
                            onUpdateLikes={(idImdb, newLikes, userId) => {
                              handleUpdateLikes(idImdb, newLikes, userId);
                            }}
                          />
                        </span>
                        <div className="vertical-line margin-left"></div>
                        <span
                          className="like-prompt like-button-mobile"
                          onClick={() => showEditComponent(film.idImdb)}>
                          Like
                        </span>
                        {/* <span>
                        <FaComment className="like-button" />
                      </span>
                      <span className="like-prompt">COMMENT</span> */}
                        <div className="vertical-line hidden-prompt"> </div>
                        {film.userId === userId && (
                          <>
                            <MdOutlineModeEdit
                              className="like-button"
                              onClick={() => showEditComponent(film.idImdb)}
                            />
                            <span
                              className="like-prompt hidden-prompt"
                              onClick={() => showEditComponent(film.idImdb)}>
                              Edit
                            </span>
                            <span className="vertical-line"> </span>
                            <BsTrash3
                              className="like-button"
                              onClick={() => showPopup(film.idImdb)}
                            />
                            <span
                              className="like-prompt hidden-prompt"
                              onClick={() => showPopup(film.idImdb)}>
                              Delete
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      {isPopupVisible && (
        <DeleteConfirmationPopup onClose={hidePopup} idImdb={selectedIdImdb} />
      )}
    </div>
  );
}
