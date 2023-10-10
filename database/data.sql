-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

insert into "Users"
  ("username", "hashedPassword")
  values
    ('usernameTest', 'uoghiaerioj0809bti58y');

insert into "RatedFilms"
  ("userId", "idImdb", "rating", "userNote");
  values
    (1, 'tt0141842', 4.0, 'this movie was jam packed with action!');

insert into "WatchList"
  ("userId", "idImdb", "rating", "userNote")
  values
    (1, 'tt0141842', 4.0, 'this movie was jam packed with action!');

insert into "Films"
  ("idImdb", "filmTitle", "genre", "type", "releaseYear", "creator", "description", "trailer")
  values
    ('tt0141842', 'The Sopranos', 'crime', 'TvSeries', 1999, 'DAVID CHASE', 'NEW JERSEY MOB BOSS TONY SOPRANO DEALS WITH PERSONAL AND PROFESSIONAL ISSUES IN HIS HOME AND BUSINESS LIFE THAT AFFECT HIS MENTAL STATE, LEADING HIM TO SEEK PROFESSIONAL PSYCHIATRIC COUNSELING.', 'https://www.imdb.com/video/embed/vi2751070489');
