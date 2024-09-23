import React, { useState, useEffect, useCallback } from 'react';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { MdKeyboardArrowRight } from 'react-icons/md';
import './PosterBanner.css';

const filmDataArray = [
  {
    id: 'tt0108052',
    title: "Schindler's List",
    image:
      'https://image.tmdb.org/t/p/original/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
  },
  {
    id: 'tt0110912',
    title: 'Pulp Fiction',
    image:
      'https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  },
  {
    id: 'tt0109830',
    title: 'Forrest Gump',
    image:
      'https://image.tmdb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
  },
  {
    id: 'tt0137523',
    title: 'Fight Club',
    image:
      'https://image.tmdb.org/t/p/original/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  },
  {
    id: 'tt1375666',
    title: 'Inception',
    image:
      'https://image.tmdb.org/t/p/original/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
  },
  {
    id: 'tt0080684',
    title: 'Star Wars: Episode V - The Empire Strikes Back',
    image:
      'https://image.tmdb.org/t/p/original/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg',
  },
  {
    id: 'tt0133093',
    title: 'The Matrix',
    image:
      'https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  },
  {
    id: 'tt0816692',
    title: 'Interstellar',
    image:
      'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  },
  {
    id: 'tt0114369',
    title: 'Se7en',
    image:
      'https://image.tmdb.org/t/p/original/6yoghtyTpznpBik8EngEmJskVUO.jpg',
  },
  {
    id: 'tt0038650',
    title: "It's a Wonderful Life",
    image:
      'https://image.tmdb.org/t/p/original/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg',
  },
  {
    id: 'tt0047478',
    title: 'Seven Samurai',
    image:
      'https://image.tmdb.org/t/p/original/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg',
  },
  {
    id: 'tt0120815',
    title: 'Saving Private Ryan',
    image:
      'https://image.tmdb.org/t/p/original/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg',
  },
  {
    id: 'tt0103064',
    title: 'Terminator 2: Judgment Day',
    image:
      'https://image.tmdb.org/t/p/original/5M0j0B18abtBI5gi2RhfjjurTqb.jpg',
  },
  {
    id: 'tt0088763',
    title: 'Back to the Future',
    image:
      'https://image.tmdb.org/t/p/original/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg',
  },
  {
    id: 'tt0245429',
    title: 'Spirited Away',
    image:
      'https://image.tmdb.org/t/p/original/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    id: 'tt6751668',
    title: 'Parasite',
    image:
      'https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    id: 'tt0054215',
    title: 'Psycho',
    image:
      'https://image.tmdb.org/t/p/original/yz4QVqPx3h1hD1DfqqQkCq3rmxW.jpg',
  },
  {
    id: 'tt0172495',
    title: 'Gladiator',
    image:
      'https://image.tmdb.org/t/p/original/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
  },
  {
    id: 'tt0110357',
    title: 'The Lion King',
    image:
      'https://image.tmdb.org/t/p/original/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
  },
  {
    id: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    image:
      'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  },
  {
    id: 'tt0407887',
    title: 'The Departed',
    image: 'https://image.tmdb.org/t/p/original/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
  },
  {
    id: 'tt2582802',
    title: 'Whiplash',
    image:
      'https://image.tmdb.org/t/p/original/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
  },
  {
    id: 'tt0095327',
    title: 'Grave of the Fireflies',
    image:
      'https://image.tmdb.org/t/p/original/k9tv1rXZbOhH7eiCk378x61kNQ1.jpg',
  },
  {
    id: 'tt0056058',
    title: 'Harakiri',
    image:
      'https://image.tmdb.org/t/p/original/5konZnIbcAxZjP616Cz5o9bKEfW.jpg',
  },
  {
    id: 'tt1838556',
    title: 'Dune: Part Two',
    image:
      'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  },
  {
    id: 'tt0034583',
    title: 'Casablanca',
    image:
      'https://image.tmdb.org/t/p/original/5K7cOHoay2mZusSLezBOY0Qxh8a.jpg',
  },
  {
    id: 'tt0047396',
    title: 'Rear Window',
    image: 'https://image.tmdb.org/t/p/original/ILVF0eJxHMddjxeQhswFtpMtqx.jpg',
  },
  {
    id: 'tt0064116',
    title: 'Once Upon a Time in the West',
    image:
      'https://image.tmdb.org/t/p/original/qbYgqOczabWNn2XKwgMtVrntD6P.jpg',
  },
  {
    id: 'tt1853728',
    title: 'Django Unchained',
    image:
      'https://image.tmdb.org/t/p/original/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
  },
  {
    id: 'tt0078788',
    title: 'Apocalypse Now',
    image:
      'https://image.tmdb.org/t/p/original/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg',
  },
  {
    id: 'tt0910970',
    title: 'WALL·E',
    image:
      'https://image.tmdb.org/t/p/original/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg',
  },
  {
    id: 'tt4154756',
    title: 'Avengers - Infinity War',
    image:
      'https://image.tmdb.org/t/p/original/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
  },
  {
    id: 'tt4633694',
    title: 'Spider-Man: Into the Spider-Verse',
    image:
      'https://image.tmdb.org/t/p/original/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
  },
  {
    id: 'tt0081505',
    title: 'The Shining',
    image:
      'https://image.tmdb.org/t/p/original/xazWoLealQwEgqZ89MLZklLZD3k.jpg',
  },
  {
    id: 'tt1345836',
    title: 'The Dark Knight Rises',
    image:
      'https://image.tmdb.org/t/p/original/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg',
  },
];
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

const PosterBanner: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [shuffledFilmData, setShuffledFilmData] = useState(filmDataArray);

  useEffect(() => {
    const shuffledData = shuffleArray(filmDataArray);
    setShuffledFilmData(shuffledData);
    setCurrentImage(shuffledData[0].image); // Set the first image immediately
  }, []);

  const totalImages = shuffledFilmData.length;

  const cycleImage = useCallback(() => {
    setCurrentImage(shuffledFilmData[imageIndex].image);
    setImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  }, [imageIndex, totalImages, shuffledFilmData]);

  useEffect(() => {
    const interval = setInterval(cycleImage, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [cycleImage]);

  // Function to handle the image click and navigate to new URL with IMDb id
  const handleImageClick = (imdbID: string) => {
    const currentURL = window.location.href;
    const newURL = `${currentURL}/${imdbID}`;
    window.location.href = newURL; // Redirect to new URL
  };

  const handleNextImage = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    setCurrentImage(shuffledFilmData[(imageIndex + 1) % totalImages].image);
  };

  const handlePreviousImage = () => {
    setImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    setCurrentImage(
      shuffledFilmData[(imageIndex - 1 + totalImages) % totalImages].image
    );
  };

  return (
    <div className="poster-banner signup-poster">
      {currentImage && (
        <div className="poster-container">
          <MdKeyboardArrowLeft
            size={45}
            className="arrow-icon"
            onClick={handlePreviousImage}
            style={{ cursor: 'pointer' }}
          />
          <img
            src={currentImage}
            alt="Film poster"
            onClick={() => handleImageClick(currentFilm.id)}
            className="poster-image"
            style={{
              width: '520px',
              height: 'auto',
              marginTop: '2rem',
              marginBottom: '2rem',
              cursor: 'pointer',
            }}
          />
          <MdKeyboardArrowRight
            size={45}
            className="arrow-icon"
            onClick={handleNextImage}
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
    </div>
  );
};

export default PosterBanner;
