import React, { useState, useEffect, useCallback } from 'react';

const FilmBanner: React.FC = () => {
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
      loadImage(filmDataArray[imageIndex].id);
      // Increment imageIndex here, before loading the next image
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

  return (
    <div style={{ textAlign: 'center' }}>
      {currentImage && (
        <img
          style={{ marginTop: '2rem', cursor: 'pointer' }}
          src={currentImage}
          alt={filmDataArray[imageIndex]?.title || 'Slideshow'}
          height="auto"
          width="1200"
        />
      )}
    </div>
  );
};

export default FilmBanner;
