-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

insert into "Users"
  ("username", "hashedPassword", "imageURL", "profileBio")
  values
    ('usernameTest', 'uoghiaerioj0809bti58y', 'superman-logo-wallpaper-blue-65884.jpg', 'I am a super big superman film fan');

-- insert into "RatedFilms"
--   ("userId", "idImdb", "rating", "userNote")
--   values
--     (1, 'tt0141842', 4.0, 'this movie was jam packed with action!');

-- insert into "WatchList"
--   ("userId", "idImdb")
--   values
--     (1, 'tt0141842');

insert into "Films"
  ("idImdb", "filmTitle", "genre", "type", "releaseYear", "creator", "description", "generalRating", "poster", "trailer")
  values
    ('tt0141842', 'The Sopranos', 'crime', 'TvSeries', 1999, 'DAVID CHASE', 'NEW JERSEY MOB BOSS TONY SOPRANO DEALS WITH PERSONAL AND PROFESSIONAL ISSUES IN HIS HOME AND BUSINESS LIFE THAT AFFECT HIS MENTAL STATE, LEADING HIM TO SEEK PROFESSIONAL PSYCHIATRIC COUNSELING.', 9.2, 'https://m.media-amazon.com/images/M/MV5BNmU3MjkzZWQtOTk1Ni00OTNiLWJhMmMtNmEyN2JjZjUzZDUyXkEyXkFqcGdeQXVyNDIyNjA2MTk@._V1_Ratio0.7046_AL_.jpg', 'https://www.imdb.com/video/embed/vi2751070489');
