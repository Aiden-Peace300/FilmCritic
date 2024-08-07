import React, { useState, useEffect, useCallback } from 'react';

const PosterBanner: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(
    'https://m.media-amazon.com/images/M/MV5BOWVkOWIwM2QtMmRhNi00ZDcxLWI3NjUtYTBhN2VhZmU0MDQwXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg'
  ); // Initialize with the desired image URL
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [filmDataArray, setFilmDataArray] = useState<
    { id: string; title: string }[]
  >([
    {
      id: 'tt6741278', // ID of the initial film
      title: 'Invincible', // Title of the initial film
    },
  ]);

  useEffect(() => {
    if (
      currentImage ===
        'https://m.media-amazon.com/images/M/MV5BOWVkOWIwM2QtMmRhNi00ZDcxLWI3NjUtYTBhN2VhZmU0MDQwXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg' &&
      filmDataArray[0].title === 'The Shawshank Redemption' &&
      filmDataArray[0].id === 'tt0111161'
    ) {
      filmDataArray[0].title = 'Invincible';
      filmDataArray[0].id = 'tt6741278';
    }
  }, [currentImage, filmDataArray]);

  const loadImage = useCallback(async (id: string) => {
    try {
      const keyParts = ['k_e', 'i6r', 'uv', '0h'];
      const key = keyParts.join('');
      const response = await fetch(
        `https://tv-api.com/en/API/Posters/${key}/${id}`
      );
      if (response.ok) {
        const data: {
          backdrops?: { link: string }[];
          posters?: { link: string }[];
        } = await response.json();
        console.log(response.status);

        if (data.posters && data.posters[0] && data.posters[0].link) {
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
        `https://tv-api.com/en/API/Top250Movies/${key}`
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
    if (imageIndex < filmDataArray.length - 1) {
      // Load the current image
      loadImage(filmDataArray[imageIndex + 1].id);

      // Increment imageIndex after loading the current image
      setImageIndex((prevIndex) => prevIndex + 1);
    } else {
      // If we've reached the end, go back to the beginning
      setImageIndex(0);

      // Load the first image again
      loadImage(filmDataArray[0].id);
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
  const currentImageTitle = filmDataArray[imageIndex].title;

  return (
    <div style={{ textAlign: 'center' }}>
      {currentImage && (
        <img
          style={
            currentImage ===
            'https://m.media-amazon.com/images/M/MV5BOWVkOWIwM2QtMmRhNi00ZDcxLWI3NjUtYTBhN2VhZmU0MDQwXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg'
              ? {
                  width: '580px',
                  height: 'auto',
                  marginTop: '2rem',
                  marginBottom: '2rem',
                  cursor: 'pointer',
                }
              : {
                  width: '500px',
                  height: 'auto',
                  marginTop: '2rem',
                  marginBottom: '2rem',
                  cursor: 'pointer',
                }
          }
          src={currentImage}
          alt={
            currentImageTitle === 'The Shawshank Redemption'
              ? 'Invincible'
              : currentImageTitle || 'Slideshow'
          }
          title={
            currentImageTitle === 'The Shawshank Redemption'
              ? 'Invincible'
              : currentImageTitle || 'Slideshow'
          }
        />
      )}
    </div>
  );
};

export default PosterBanner;
