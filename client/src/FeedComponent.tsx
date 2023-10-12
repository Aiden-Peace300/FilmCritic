// import { BsTrash3 } from "react-icons/bs";
import DeleteConfirmationPopup from './RatedDeletePopup';
// import { GrEdit } from "react-icons/gr";
import { FaRegCommentAlt } from 'react-icons/fa';
import { AiOutlineHeart } from 'react-icons/ai';
import RatedStars from './RatedStars';
// import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

type RatedFilm = {
  idImdb: string;
  userNote: string;
  rating: number;
};

type FilmTitleAndPoster = {
  title: string;
  filmPosters: string;
};

export default function FeedComponent() {
  // const navigate = useNavigate();
  const [ratedFilms, setRatedFilms] = useState<
    (RatedFilm & FilmTitleAndPoster)[]
  >([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedIdImdb, setSelectedIdImdb] = useState<string | null>(null); // Add selectedIdImdb state
  // const [isEditVisible, setEditVisible] = useState(false);

  // // Function to show the popup
  // const showPopup = (idImdb: string) => {
  //   setSelectedIdImdb(idImdb); // Set the selected ID when showing the popup
  //   setPopupVisible(true);
  // };

  // Function to hide the popup
  const hidePopup = () => {
    setSelectedIdImdb(null); // Clear the selected ID when hiding the popup
    setPopupVisible(false);
  };

  // const showEditComponent = (idImdb) => {
  //   console.log('Showing Edit Component for idImdb:', idImdb);
  //   navigate(`${idImdb}`);
  //   // setEditVisible(true);
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Edit/ratedFilms', {
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

  //   // Function to render the "Edit" and "Delete" options
  //   const renderEditDeleteOptions = (film, user) => {
  //     if (user && film.userId === user.userId) {
  //     // The film belongs to the authenticated user
  //     return (
  //       <div>
  //         <GrEdit
  //           className="like-button"
  //           onClick={() => showEditComponent(film.idImdb)}
  //         />
  //         <span
  //           className="like-prompt"
  //           onClick={() => showEditComponent(film.idImdb)}
  //         >
  //           EDIT
  //         </span>
  //         <div className="vertical-line"> </div>
  //         <BsTrash3
  //           className="like-button"
  //           onClick={() => showPopup(film.idImdb)}
  //         />
  //         <span
  //           className="like-prompt"
  //           onClick={() => showPopup(film.idImdb)}
  //         >
  //           DELETE
  //         </span>
  //       </div>
  //     );
  //   } else {
  //     // The film does not belong to the authenticated user
  //     return null;
  //   }
  // };

  return (
    <div>
      <h1>FEED</h1>
      <div className="row1">
        {ratedFilms
          .slice()
          .reverse()
          .map((film) => (
            <div className="column1" key={film.idImdb}>
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
                    <hr className="line" />
                    <div className="rating-container">
                      <span>{<RatedStars rating={film.rating} />}</span>
                      <span className="ratedRating">{film.rating}/5</span>
                      <div className="vertical-line"> </div>
                      <span>
                        <AiOutlineHeart className="like-button" />
                      </span>
                      <span className="like-prompt">LIKE</span>
                      <div className="vertical-line"> </div>
                      <span>
                        <FaRegCommentAlt className="like-button" />
                      </span>
                      <span className="like-prompt">COMMENT</span>
                      <div className="vertical-line"> </div>
                      {/* {renderEditDeleteOptions(film, user)} Render "Edit" and "Delete" */}
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
