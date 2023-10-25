# [FilmCritic](http://filmcritic-dev.us-west-1.elasticbeanstalk.com/)


## Overview
FilmCritic is a full-stack web application created for film enthusiasts who want to discover new movies and shows based on their preferences. It combines the power of AI-driven recommendations with real-time streaming availability data, creating a seamless experience for users to explore and enjoy their favorite films.

## API Integration
FilmCritic leverages the capabilities of several APIs to provide a rich user experience:

- [OpenAI GPT Chat Completions API](https://platform.openai.com/docs/guides/gpt/chat-completions-api): To offer personalized film recommendations by understanding user preferences.
- [Movie of the Night API](https://www.movieofthenight.com/about/api): Enhancing our recommendation engine with real-time streaming availability data.
- [IMDb API](https://imdb-api.com/api): For fetching comprehensive information about movies and shows.

## Key Features
1. Personalized Film Recommendations: Utilizing the OpenAI GPT Chat Completions API, users can input a film they enjoy, and the application will generate a list of five movie recommendations based on their input. The AI-driven system formulates prompts and queries the database for closely resembling films, delivering a tailored watchlist to the user.

```javascript
/**
 * Fetch film recommendations based on user input, fetch details from IMDb API,
 * and update component state with the results.
 * @param {string} filmFromUser - The user's input.
 */
async function getRecommendations(filmFromUser) {
  setIsLoading(true);
  const suggestion = await suggestionFromAI(
    `GIVE ME A LIST OF 5 FILMS THAT WOULD CLOSELY RESEMBLE THIS FILM (ONLY THE NAMES OF THE FILMS, NO OTHER PROMPTS WITH NO NUMBERING): ${filmFromUser}?`
  );

  // Break the suggestion into individual show names
  const showStrings = breakShowsFilmsStrings(suggestion);

  const fetchAllPromises: Promise<any>[] = [];

  for (const showName of showStrings) {
    // Remove digits and hyphens from the show name using regular expressions
    const cleanShowName = showName
      .trim()
      .replace(/\d+/g, '')
      .replace(/-/g, '');

    if (cleanShowName.length !== 0) {
      console.log('Suggestion From AI:', cleanShowName);
      fetchAllPromises.push(findFilmInIMDB(cleanShowName));
      fetchAllPromises.push(findTitleInFilmIMDB(cleanShowName));
      fetchAllPromises.push(handleFilmDetails(cleanShowName));
    }
  }

  try {
    const fetchAllPromiseResults = await Promise.all(fetchAllPromises);
    const showImagesArray: (string | undefined)[] = [];
    const showTitleArray: (string | undefined)[] = [];
    const showImdbIdArray: any[] = [];

    for (let i = 0; i < fetchAllPromiseResults.length; i += 3) {
      showImagesArray.push(fetchAllPromiseResults[i]);
      showTitleArray.push(fetchAllPromiseResults[i + 1]);
      showImdbIdArray.push(fetchAllPromiseResults[i + 2]);
    }
    console.log('Show Images:', showImagesArray);
    console.log('Show titles', showTitleArray);
    console.log("show id's", showImdbIdArray);

    setIsLoading(false);

    // Set the show images in the state
    setShowImages(showImagesArray.filter(Boolean) as string[]);
    setShowTitle(showTitleArray.filter(Boolean) as string[]);
    setShowId(showImdbIdArray);
  } catch (error) {
    console.error('Error:', error);
  }
}
```
- The system employs a combination of AI and data from the IMDb API to provide a unique film discovery experience, resulting in a highly personalized movie selection for the user.
  
2. Watchlist Management: Users have the ability to curate their personalized watchlist by saving movie recommendations. These films are then conveniently accessible from the user's profile, ensuring that users never miss a potential cinematic gem. Additionally, users can view detailed film information, including trailers and a list of available streaming platforms.
  
```javascript
  /**
   * Adds film details to the films table and watchlist.
   * @param {FilmDetails} detailsObj - Details of the film.
   */
  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        const idImdb = extractParameterFromCurrentUrl();

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        const releaseYearNumber = parseInt(detailsObj.releaseYear, 10);

        const responseFilms = await fetch('/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idImdb: detailsObj.idImdb,
            filmTitle: detailsObj.filmTitle,
            genre: detailsObj.genre,
            type: detailsObj.type,
            releaseYear: releaseYearNumber,
            creator: detailsObj.creator,
            description: detailsObj.description,
            generalRating: detailsObj.generalRating,
            poster: detailsObj.poster,
            trailer: detailsObj.trailer,
          }),
        });

        console.log(
          'responseFilms after adding to films table: ',
          responseFilms
        );

        const responseWatchlist = await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({ idImdb }),
        });

        if (responseWatchlist.status === 201) {
          console.log('Movie added to watchlist');
          navigate(-1);
        } else {
          console.error('Failed to add movie to watchlist');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [navigate]
  );

```
- Behind the scenes, the application manages user-specific watchlists and stores relevant film information, allowing for easy access and exploration of saved films. Users can seamlessly access trailers and discover where to stream the film.

3. User-Generated Movie Reviews and Ratings: This feature empowers users to contribute to the film-loving community by creating and sharing their movie thoughts. Users can write detailed reviews, rate films, and add valuable insights to the community feed. When a user submits a review, the system collects and stores the relevant information.

```javascript
  /**
   * Add film details to the films table and watchlist.
   * @param {FilmDetails} detailsObj - Film details to add.
   */
  const addToFilmsTableAndWatchlist = useCallback(
    async (detailsObj) => {
      try {
        if (!detailsObj) {
          console.error('detailsObj is null');
          return;
        }

        const idImdb = detailsObj.idImdb;

        if (!idImdb) {
          console.error('idImdb is missing');
          return;
        }

        const releaseYearNumber = parseInt(detailsObj.releaseYear, 10);

        const responseFilms = await fetch('/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idImdb: detailsObj.idImdb,
            filmTitle: detailsObj.filmTitle,
            genre: detailsObj.genre,
            type: detailsObj.type,
            releaseYear: releaseYearNumber,
            creator: detailsObj.creator,
            description: detailsObj.description,
            generalRating: detailsObj.generalRating,
            poster: detailsObj.poster,
            trailer: detailsObj.trailer,
          }),
        });

        const responseRatedFilms = await fetch('/api/rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({ idImdb, rating, userNote: note }),
        });

        if (responseFilms.status === 201) {
          console.log('Movie added to films table');
          navigate('/movieApp/profile');
        } else if (responseFilms.status === 200) {
          console.log('Movie already in films table');
          navigate('/movieApp/profile');
        } else {
          console.error('Failed to add movie to films table');
          navigate('/movieApp/profile');
        }

        if (responseRatedFilms.status === 201) {
          console.log('Movie added to watchlist');
        } else if (responseRatedFilms.status === 200) {
          console.log('Movie already in watchlist');
        } else {
          console.error('Failed to add movie to watchlist');
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
      }
    },
    [rating, note, navigate]
  );
```
- Users can actively engage in discussions, contribute their opinions, and interact with the film community. The system records and displays these user-generated reviews and ratings, enhancing the film discovery experience.

4. Rated Films History: Users can view a detailed history of movies they've rated, including their reviews and ratings. This information is conveniently accessible from their user profile.

```javascript
  /**
   * Asynchronously fetches and sets the user's rated film data, including film titles and posters.
   */
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

    // Execute fetchData when the component mounts
    fetchData();
  }, []);
```
5. Edit Post Management: Users have the ability to edit and update their posts with ease. If they change their opinion or want to add more insights, they have full control over their contributions. The system prepopulates the information with the user's previous ratings and notes.

```javascript
  /**
   * Retrieves the user's past rating and note from the server and updates the state.
   */
  const gettingUsersPastRating = useCallback(async () => {
    try {
      const response = await fetch(`/api/Edit/ratedFilms/${idImdb}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.status === 404) {
        console.error('Resource not found (404)');
      } else if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setRating(data[0].rating);
          setNote(data[0].userNote);
        }
      } else {
        console.error('Failed to fetch user rating and note from the server');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [idImdb]);
```

6. Social Interaction: Users can interact with other users by liking their posts in the feed. They can engage in discussions, discover new films, and expand their film network.

```javascript
  /**
   * Handles updating likes for a film.
   * @param {string} idImdb The IMDb ID of the film.
   * @param {number} newLikes The new likes count.
   * @param {number} userId The user's ID.
   */
  const handleUpdateLikes = (idImdb, newLikes, userId) => {
    setRatedFilms((prevFilms) => {
      // Create a copy of the previous state
      const updatedFilms = [...prevFilms];

      // Find the index of the film in the array
      const filmIndex = updatedFilms.findIndex(
        (film) => film.idImdb === idImdb && film.userId === userId
      );

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
```


## Database 

Here's an overview of the database schema used in FilmCritic:

```javascript
set client_min_messages to warning;

drop schema "public" cascade;

create schema "public";

CREATE TABLE "public"."Users" (
  "userId" serial PRIMARY KEY,
  "username" text not null,
  "hashedPassword" text not null,
  "imageURL" text,
  "profileBio" text,
  "updatedAt" timestamptz(6) not null default now(),
  "createdAt" timestamptz(6) not null default now()
);

CREATE TABLE "public"."RatedFilms" (
  "userId" integer not null,
  "idImdb" text not null,
  "rating" float not null,
  "userNote" text not null,
  "likes" integer not null,
  "updatedAt" timestamptz(6) not null default now(),
  "createdAt" timestamptz(6) not null default now(),
  PRIMARY KEY ("userId", "idImdb")
);

CREATE TABLE "public"."WatchList" (
  "userId" integer not null,
  "idImdb" text not null,
  "createdAt" timestamptz(6) not null default now(),
  PRIMARY KEY ("userId", "idImdb")
);

CREATE TABLE "public"."Films" (
  "idImdb" text PRIMARY KEY,
  "filmTitle" text not null,
  "genre" text not null,
  "type" text not null,
  "releaseYear" integer not null,
  "creator" text not null,
  "description" text not null,
  "generalRating" text not null,
  "poster" text not null,
  "trailer" text not null
);

ALTER TABLE "WatchList" ADD FOREIGN KEY ("idImdb") REFERENCES "Films" ("idImdb");

ALTER TABLE "RatedFilms" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("userId");

ALTER TABLE "WatchList" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("userId");

ALTER TABLE "RatedFilms" ADD FOREIGN KEY ("idImdb") REFERENCES "Films" ("idImdb");
```

## Get Started
FilmCritic is your gateway to a world of cinematic discovery. Here's how to begin your journey:

1. Search for a film you love and receive tailored recommendations.
2. Save the films you're interested in, and view the film in your watchlist.
3. Share your film experiences through reviews and ratings.
4. Interact with fellow film enthusiasts in the community feed by liking their posts.
5. Explore and manage your rated film's history.

## Contact
Enjoy our application, and may your film adventures be filled with popcorn, laughter, and cinematic wonders! 🎥🍿

For any suggestions, feedback, or inquiries, please feel free to reach out to me at aidenpeacecodes@gmail.com. I'd love to hear from you and continue improving your film discovery experience.
