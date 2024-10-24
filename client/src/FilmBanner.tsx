import React, { useState, useEffect, useCallback } from 'react';
import './PosterBanner.css';

const filmDataArray = [
  {
    id: 'tt0468569',
    title: 'The Dark Knight',
    image:
      'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
  },
  {
    id: 'tt0108052',
    title: "Schindler's List",
    image:
      'https://image.tmdb.org/t/p/original/zb6fM1CX41D9rF9hdgclu0peUmy.jpg',
  },
  {
    id: 'tt0109830',
    title: 'Forrest Gump',
    image:
      'https://image.tmdb.org/t/p/original/ghgfzbEV7kbpbi1O8eIILKVXEA8.jpg',
  },
  {
    id: 'tt0137523',
    title: 'Fight Club',
    image:
      'https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
  },
  {
    id: 'tt0133093',
    title: 'The Matrix',
    image:
      'https://image.tmdb.org/t/p/original/ncEsesgOJDNrTUED89hYbA117wo.jpg',
  },
  {
    id: 'tt0816692',
    title: 'Interstellar',
    image:
      'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
  },
  {
    id: 'tt0110357',
    title: 'The Lion King',
    image:
      'https://image.tmdb.org/t/p/original/wXsQvli6tWqja51pYxXNG1LFIGV.jpg',
  },
  {
    id: 'tt0095327',
    title: 'Grave of the Fireflies',
    image:
      'https://image.tmdb.org/t/p/original/gwj4R8Uy1GwejKqfofREKI9Jh7L.jpg',
  },
  {
    id: 'tt0090605',
    title: 'Aliens',
    image:
      'https://image.tmdb.org/t/p/original/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg',
  },
  {
    id: 'tt0027977',
    title: 'City Lights',
    image:
      'https://image.tmdb.org/t/p/original/n0Cju2Eu3VyrUFl32thblHFWznA.jpg',
  },
  {
    id: 'tt0910970',
    title: 'WALL·E',
    image:
      'https://image.tmdb.org/t/p/original/fK5ssgvtI43z19FoWigdlqgpLRE.jpg',
  },
  {
    id: 'tt4633694',
    title: 'Spider-Man: Into the Spider-Verse',
    image:
      'https://image.tmdb.org/t/p/original/b9YkKJcW3pPaXgMZu9uoT7v9yRB.jpg',
  },
  {
    id: 'tt0114709',
    title: 'Toy Story',
    image:
      'https://image.tmdb.org/t/p/original/lxD5ak7BOoinRNehOCA85CQ8ubr.jpg',
  },
  {
    id: 'tt0119217',
    title: 'Good Will Hunting',
    image:
      'https://image.tmdb.org/t/p/original/oLsts7ct0NVkdYpx5rZg10MG6zh.jpg',
  },
  {
    id: 'tt0086190',
    title: 'Return of the Jedi',
    image:
      'https://image.tmdb.org/t/p/original/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg',
  },
  {
    id: 'tt0338013',
    title: 'Eternal Sunshine of the Spotless Mind',
    image:
      'https://image.tmdb.org/t/p/original/8AE7M2lMsyvowfT36porzGtmOtI.jpg',
  },
  {
    id: 'tt0062622',
    title: '2001: A Space Odyssey',
    image:
      'https://image.tmdb.org/t/p/original/w5IDXtifKntw0ajv2co7jFlTQDM.jpg',
  },
  {
    id: 'tt0086250',
    title: 'Scarface',
    image:
      'https://image.tmdb.org/t/p/original/cCvp5Sni75agCtyJkNOMapORUQV.jpg',
  },
  {
    id: 'tt0052357', // Vertigo
    title: 'Vertigo',
    image:
      'https://image.tmdb.org/t/p/original/oVDkfWqMMTNryxq60eQdVMMYaw7.jpg',
  },
  {
    id: 'tt15398776', // Oppenheimer
    title: 'Oppenheimer',
    image:
      'https://image.tmdb.org/t/p/original/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg',
  },
  {
    id: 'tt0070735', // The Sting
    title: 'The Sting',
    image:
      'https://image.tmdb.org/t/p/original/1r9lH3DaSWKGyvZaoo6BF5STOk5.jpg',
  },
  {
    id: 'tt0095016', // Die Hard
    title: 'Die Hard',
    image:
      'https://image.tmdb.org/t/p/original/rahJyvdMruvqUmSLWRQKYS57mx8.jpg',
  },
  {
    id: 'tt0361748', // Inglourious Basterds
    title: 'Inglourious Basterds',
    image:
      'https://image.tmdb.org/t/p/original/lh5lbisD4oDbEKgUxoRaZU8HVrk.jpg',
  },
  {
    id: 'tt0075314', // Taxi Driver
    title: 'Taxi Driver',
    image:
      'https://image.tmdb.org/t/p/original/6aoyUbvu0419XLKLIMoH0TkEicH.jpg',
  },
  {
    id: 'tt0372784', // Batman Begins
    title: 'Batman Begins',
    image:
      'https://image.tmdb.org/t/p/original/x0bQvdpr88xVhMrVM93tEIKSM2q.jpg',
  },
  {
    id: 'tt0059578', // For a Few Dollars More
    title: 'For a Few Dollars More',
    image:
      'https://image.tmdb.org/t/p/original/7Nwnmyzrtd0FkcRyPqmdzTPppQa.jpg',
  },
  {
    id: 'tt0469494', // There Will Be Blood
    title: 'There Will Be Blood',
    image:
      'https://image.tmdb.org/t/p/original/zPQYSaRUzCAksd25fLEVbh3zQcv.jpg',
  },
  {
    id: 'tt0107290', // Jurassic Park
    title: 'Jurassic Park',
    image:
      'https://image.tmdb.org/t/p/original/79bJL9ydAMYVltuNTt4VhxORqIz.jpg',
  },
  {
    id: 'tt0266697', // Kill Bill - Vol. 1
    title: 'Kill Bill - Vol. 1',
    image:
      'https://image.tmdb.org/t/p/original/lVy5Zqcty2NfemqKYbVJfdg44rK.jpg',
  },
  {
    id: 'tt0266543', // Finding Nemo
    title: 'Finding Nemo',
    image:
      'https://image.tmdb.org/t/p/original/eCynaAOgYYiw5yN5lBwz3IxqvaW.jpg',
  },
  {
    id: 'tt0347149', // Howl's Moving Castle
    title: "Howl's Moving Castle",
    image:
      'https://image.tmdb.org/t/p/original/xqaN2WYQclQlqvKvsOcNgOx2vRn.jpg',
  },
  {
    id: 'tt2096673', // Inside Out
    title: 'Inside Out',
    image:
      'https://image.tmdb.org/t/p/original/j29ekbcLpBvxnGk6LjdTc2EI5SA.jpg',
  },
  {
    id: 'tt0434409', // V for Vendetta
    title: 'V for Vendetta',
    image:
      'https://image.tmdb.org/t/p/original/sFEYsEfzTx7hhjetlNrme8B5OUo.jpg',
  },
  {
    id: 'tt10872600', // Spider-Man: No Way Home
    title: 'Spider-Man: No Way Home',
    image:
      'https://image.tmdb.org/t/p/original/zD5v1E4joAzFvmAEytt7fM3ivyT.jpg',
  },
  {
    id: 'tt0096283', // My Neighbor Totoro
    title: 'My Neighbor Totoro',
    image:
      'https://image.tmdb.org/t/p/original/fxYazFVeOCHpHwuqGuiqcCTw162.jpg',
  },
  {
    id: 'tt0083658', // Blade Runner
    title: 'Blade Runner',
    image:
      'https://image.tmdb.org/t/p/original/qr7dUqleMRd0VgollazbmyP9XjI.jpg',
  },
  {
    id: 'tt0015864', // The Gold Rush
    title: 'The Gold Rush',
    image:
      'https://image.tmdb.org/t/p/original/hZHeDPQGNKN9NN9GuW7qVbM2tDx.jpg',
  },
  {
    id: 'tt0198781', // Monsters, Inc.
    title: 'Monsters, Inc.',
    image:
      'https://image.tmdb.org/t/p/original/puo6orN2BjQt1g4K0umVlooVff9.jpg',
  },
  {
    id: 'tt0073195', // Jaws
    title: 'Jaws',
    image:
      'https://image.tmdb.org/t/p/original/3nYlM34QhzdtAvWRV5bN4nLtnTc.jpg',
  },
  {
    id: 'tt1950186', // Ford v Ferrari
    title: 'Ford v Ferrari',
    image:
      'https://image.tmdb.org/t/p/original/2vq5GTJOahE03mNYZGxIynlHcWr.jpg',
  },
  {
    id: 'tt0075148', // Rocky
    title: 'Rocky',
    image:
      'https://image.tmdb.org/t/p/original/kK9v1wclQxug6ZUJucD4DTaHgVF.jpg',
  },
  {
    id: 'tt0118715', // The Big Lebowski
    title: 'The Big Lebowski',
    image:
      'https://image.tmdb.org/t/p/original/nevS6wjzCxZESvmjJZqdyZ3RNQ6.jpg',
  },
  {
    id: 'tt0395169', // Hotel Rwanda
    title: 'Hotel Rwanda',
    image:
      'https://image.tmdb.org/t/p/original/ljEdpkceJ9b3TEcTVQISS0Goft0.jpg',
  },
  {
    id: 'tt0113247', // La Haine
    title: 'La Haine',
    image:
      'https://image.tmdb.org/t/p/original/viGCwLxupyoaLsa6hrnu1gYrB0B.jpg',
  },
  {
    id: 'tt0325980', // Pirates of the Caribbean
    title: 'Pirates of the Caribbean',
    image:
      'https://image.tmdb.org/t/p/original/wW7Wt5bXzPy4VOEE4LTIUDyDgBo.jpg',
  },
  {
    id: 'tt0317705', // The Incredibles
    title: 'The Incredibles',
    image:
      'https://image.tmdb.org/t/p/original/cnORTKYtAzPXIY6lizTJspfoXnd.jpg',
  },
  {
    id: 'tt0032138', // The Wizard of Oz
    title: 'The Wizard of Oz',
    image:
      'https://image.tmdb.org/t/p/original/nRsr98MFztBGm532hCVMGXV6qOp.jpg',
  },
  {
    id: 'tt0092005', // Stand By Me
    title: 'Stand By Me',
    image:
      'https://image.tmdb.org/t/p/original/yjGllQUm28R4X9xD9T5xMszirgw.jpg',
  },
  {
    id: 'tt0059742', // The Sound of Music
    title: 'The Sound of Music',
    image:
      'https://image.tmdb.org/t/p/original/m5n1nguLC3pTJLPKhN5Ek0aNT6E.jpg',
  },
  {
    id: 'tt0758758', // Into the Wild
    title: 'Into the Wild',
    image:
      'https://m.media-amazon.com/images/M/MV5BMTU1MjEzODE3NF5BMl5BanBnXkFtZTcwMTU0ODcxNA@@._V1_FMjpg_UX2048_.jpg',
  },
  {
    id: 'tt0107048', // Groundhog Day
    title: 'Groundhog Day',
    image:
      'https://image.tmdb.org/t/p/original/ttBydD0SynC0TMkW3AcnmsySkLp.jpg',
  },
  {
    id: 'tt0129167', // The Iron Giant
    title: 'The Iron Giant',
    image:
      'https://image.tmdb.org/t/p/original/gZ78dyRH9hXeH94ASjuvD9Vw4b5.jpg',
  },
  {
    id: 'tt0025316', // It Happened One Night
    title: 'It Happened One Night',
    image:
      'https://image.tmdb.org/t/p/original/hmiC0MsI0PDd1TJXC62xyw0tX0s.jpg',
  },
  {
    id: 'tt0103639', // Aladdin
    title: 'Aladdin',
    image:
      'https://image.tmdb.org/t/p/original/nenJjvfe2Eq8uBMXFJnWj5mw4bi.jpg',
  },
  {
    id: 'tt10121392', // Invincible (TV series IMDb number)
    title: 'Invincible',
    image:
      'https://image.tmdb.org/t/p/original/dfmPbyeZZSz3bekeESvMJaH91gS.jpg',
  },
];

// Shuffle array function (no changes)
function shuffleArray(array: any[]) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

const FilmBanner: React.FC = () => {
  const [currentFilm, setCurrentFilm] = useState<{
    image: string;
    title: string;
    id: string; // Added id for IMDb
  } | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [shuffledFilmData, setShuffledFilmData] = useState(filmDataArray);

  useEffect(() => {
    const shuffledData = shuffleArray(filmDataArray);
    setShuffledFilmData(shuffledData);
    setCurrentFilm({
      image: shuffledData[0].image,
      title: shuffledData[0].title,
      id: shuffledData[0].id, // Set the id for IMDb
    });
  }, []);

  const totalImages = shuffledFilmData.length;

  const cycleImage = useCallback(() => {
    const nextFilm = shuffledFilmData[imageIndex];
    setCurrentFilm({
      image: nextFilm.image,
      title: nextFilm.title,
      id: nextFilm.id, // Update the id for IMDb
    });
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

  return (
    <div className="poster-banner signup-poster">
      {currentFilm && (
        <div className="poster-container-banner">
          <img
            src={currentFilm.image}
            title={currentFilm.title}
            alt={currentFilm.title}
            onClick={() => handleImageClick(currentFilm.id)}
            className="poster-image"
            style={{
              marginTop: '2rem',
              marginBottom: '2rem',
              cursor: 'pointer',
              width: '85%',
              height: 'auto',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <div className="middle">
            <div className="text-poster">{currentFilm.title.toUpperCase()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmBanner;
