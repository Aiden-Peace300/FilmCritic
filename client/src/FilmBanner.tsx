import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const FilmBanner: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [filmDataArray, setFilmDataArray] = useState<
    { id: string; title: string }[]
  >([]);

  const loadImage = useCallback(async (id: string) => {
    try {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');
      const response = await fetch(
        `https://imdb-api.com/en/API/Posters/${key}/${id}`
      );
      if (response.ok) {
        const data: {
          backdrops?: { link: string }[];
          posters?: { link: string }[];
        } = await response.json();
        console.log(response.status);

        if (data.backdrops && data.backdrops[0] && data.backdrops[0].link) {
          setCurrentImage(data.backdrops[0].link);
        } else if (data.posters && data.posters[0] && data.posters[0].link) {
          setCurrentImage(data.posters[0].link);
        } else {
          console.error('No valid link found in response for id: ' + id);
          console.error(data);
        }
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const getIds = useCallback(async () => {
    const keyParts = ['k_e', 'i6r', 'uv', '0h'];
    const key = keyParts.join('');

    try {
      const response = await fetch(
        `https://imdb-api.com/en/API/Top250Movies/${key}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(response.status);
        if (data && data.items) {
          const newFilmDataArray = data.items.map((item) => ({
            id: item.id,
            title: item.title,
          }));
          setFilmDataArray(newFilmDataArray);
          console.log(newFilmDataArray);
        } else {
          console.error('No items found in the response:', data);
        }
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const startSlideshow = useCallback(() => {
    if (imageIndex < filmDataArray.length) {
      // Load the current image
      loadImage(filmDataArray[imageIndex + 1].id);

      // Increment imageIndex after loading the current image
      setImageIndex((prevIndex) => prevIndex + 1);
    }
  }, [imageIndex, filmDataArray, loadImage]);

  useEffect(() => {
    getIds();
  }, [getIds]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      startSlideshow();
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }, [startSlideshow]);

  // Create a variable to hold the title of the current image
  const currentImageTitle = filmDataArray[imageIndex]?.title;

  return (
    <div style={{ textAlign: 'center' }}>
      {currentImage && (
        <img
          style={{
            marginTop: '2rem',
            marginBottom: '2rem',
            cursor: 'pointer',
            width: '90%', // Set the width to 100% for responsiveness
            height: 'auto', // Maintain the aspect ratio
          }}
          src={currentImage}
          alt={currentImageTitle || 'Slideshow'}
          title={currentImageTitle || 'Slideshow'}
          onClick={() => navigate(`${filmDataArray[imageIndex].id}`)}
        />
      )}
    </div>
  );
};

export default FilmBanner;
