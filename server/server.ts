import 'dotenv/config';
import pg from 'pg';
import argon2 from 'argon2';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';
import { uploadsMiddleware } from './lib/uploads-middleware.js';

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
// eslint-disable-next-line no-unused-vars -- Remove when used
const db = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));

// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

/**
 * Handles user sign-up by adding a new user to the database.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the newly created user.
 * @throws {ClientError} if username or password are missing or if the username is already taken.
 */
app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(400, 'username and password are required fields');
    }

    const checkUsernameSql = `
      SELECT * FROM "Users" WHERE "username" = $1
    `;
    const checkUsernameParams = [username];
    const usernameResult = await db.query(
      checkUsernameSql,
      checkUsernameParams
    );

    if (usernameResult.rows.length > 0) {
      throw new ClientError(400, 'Username is already taken');
    }

    const hashedPassword = await argon2.hash(password);
    const insertUserSql = `
      INSERT INTO "Users" ("username", "hashedPassword", "imageURL", "profileBio")
      VALUES ($1, $2, null, null)
      RETURNING *
    `;
    const insertUserParams = [username, hashedPassword];
    const result = await db.query(insertUserSql, insertUserParams);
    const [user] = result.rows;
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles user sign-in by verifying credentials and generating a JWT token.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to a JWT token and user payload.
 * @throws {ClientError} if credentials are invalid or if the TOKEN_SECRET environment variable is not defined.
 */
app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(401, 'invalid login');
    }

    const sql = `
      SELECT "userId", "hashedPassword"
      FROM "Users"
      WHERE username = $1`;

    const result = await db.query(sql, [username]);

    if (result.rows.length === 0) {
      throw new ClientError(401, 'invalid login');
    }

    const user = result.rows[0];

    const passwordMatch = await argon2.verify(user.hashedPassword, password);

    if (!passwordMatch) {
      throw new ClientError(401, 'invalid login');
    }

    if (!process.env.TOKEN_SECRET) {
      throw new Error('TOKEN_SECRET environment variable is not defined');
    }

    const payload = {
      userId: user.userId,
      username,
    };

    const token = jwt.sign(payload, process.env.TOKEN_SECRET);

    res.status(200).json({
      token,
      payload,
    });
  } catch (err) {
    console.error('Error in /api/auth/sign-in:', err);
    next(err);
  }
});

app.get('/api/get-ai-key', authMiddleware, (req, res) => {
  // Ensure this is only available to authorized users
  try {
    const aiKey = process.env.AI_API_KEY; // Securely retrieve the AI_API_KEY from environment variables

    if (!aiKey) {
      throw new Error(
        'AI_API_KEY is not configured in the environment variables'
      );
    }

    res.status(200).json({ apiKey: aiKey });
  } catch (err) {
    console.error('Error fetching AI_API_KEY:', err);
    res.status(500).json({ error: 'Failed to retrieve AI API key' });
  }
});

/**
 * Deletes a user by their user ID.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @throws {ClientError} if userId is not an integer or if the user is not found.
 */
app.delete('/api/users/:userId', async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      throw new ClientError(400, 'userId must be an integer');
    }
    const sql = `
      delete from "Users"
        where "userId" = $1 and "username" = $2
        returning *;
    `;
    const params = [userId, username];
    const result = await db.query(sql, params);
    const [deleted] = result.rows;
    if (!deleted) {
      throw new ClientError(404, `Entry with id ${userId} not found`);
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

/**
 * Updates a user's profile picture.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the updated user with the new profile picture.
 * @throws {ClientError} if there is no file in the request or if userId is undefined.
 */
app.post(
  '/api/updateProfilePicture',
  authMiddleware,
  uploadsMiddleware.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new ClientError(400, 'no file field in request');

      const imageUrl = `/images/${req.file.filename}`;

      if (req.user === undefined) {
        throw new ClientError(401, 'userId is undefined');
      }
      const { userId } = req.user;

      const updateProfilePictureSql = `
      UPDATE "Users"
      SET "imageURL" = $1
      WHERE "userId" = $2
      RETURNING *
    `;
      const updateProfilePictureParams = [imageUrl, userId];
      const result = await db.query(
        updateProfilePictureSql,
        updateProfilePictureParams
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = result.rows[0];
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Gets a user's profile picture URL.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @throws {ClientError} if userId is undefined.
 */
app.get('/api/profilePicture', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    const sql = `
      SELECT "imageURL" FROM "Users" WHERE "userId" = $1
    `;

    const result = await db.query(sql, [userId]);

    if (result.rows.length > 0) {
      const profilePictureUrl = result.rows[0].imageURL;
      res.status(200).json({ imageUrl: profilePictureUrl });
    } else {
      res.status(404).json({ imageUrl: null });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Gets a user's username.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @throws {ClientError} if userId is undefined.
 */
app.get('/api/username', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    const sql = `
      SELECT "username" FROM "Users" WHERE "userId" = $1
    `;

    const result = await db.query(sql, [userId]);

    if (result.rows.length > 0) {
      const username = result.rows[0].username;
      res.status(200).json({ username: username });
    } else {
      res.status(404).json({ username: null });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Gets a user's profile bio.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @throws {ClientError} if userId is undefined.
 */
app.get('/api/userBio', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    const sql = `
      SELECT "profileBio" FROM "Users" WHERE "userId" = $1
    `;

    const result = await db.query(sql, [userId]);

    if (result.rows.length > 0) {
      const profileBio = result.rows[0].profileBio;
      res.status(200).json({ profileBio: profileBio });
    } else {
      res.status(404).json({ profileBio: null });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Updates a user's profile bio.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the updated user with the new profile bio.
 * @throws {ClientError} if profileBio is missing or if userId is undefined.
 */
app.post('/api/enter/userBio', authMiddleware, async (req, res, next) => {
  try {
    const { profileBio } = req.body;

    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    console.log('profileBio ', profileBio);
    if (!profileBio) {
      throw new ClientError(400, 'profileBio is a required field');
    }

    // Update the user's profileBio in the Users table
    const updateProfileBioSql = `
      UPDATE "Users"
      SET "profileBio" = $1
      WHERE "userId" = $2
      RETURNING *
    `;
    const updateProfileBioParams = [profileBio, userId];
    const result = await db.query(updateProfileBioSql, updateProfileBioParams);

    // console.log('result: ', result)
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const updatedUser = result.rows[0];
      res.status(200).json({ profileBio: updatedUser.profileBio });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Checks if a user with the username "UnknownUser" exists.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to a response indicating whether the user exists.
 * @throws {ClientError} if userId is undefined.
 */
app.get('/api/check-unknown-user', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'User is not logged in');
    }

    const { userId } = req.user;

    if (userId) {
      // Check if a user with userId and username "UnknownUser" exists in the "Users" table
      const checkUnknownUserSql = `
        SELECT * FROM "Users" WHERE "userId" = $1 AND "username" = 'UnknownUser'
      `;
      const checkUnknownUserParams = [userId];
      const unknownUserResult = await db.query(
        checkUnknownUserSql,
        checkUnknownUserParams
      );

      if (unknownUserResult.rows.length > 0) {
        res.status(200).json({ userExists: true });
      } else {
        res.status(200).json({ userExists: false });
      }
    } else {
      res.status(401).json({ error: 'User ID not available in req.user' });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Handles guest sign-in using predefined guest credentials.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to a JWT token and user payload for the guest user.
 * @throws {ClientError} if guest credentials are invalid or if the TOKEN_SECRET environment variable is not defined.
 */
app.post('/api/auth/sign-in-guest', async (req, res, next) => {
  try {
    const guestUsername = 'UnknownUser';
    const guestPassword = 'UnknownUserPassword';

    // Check if the guest credentials are provided in the request
    const { username, password } = req.body;

    if (username === guestUsername && password === guestPassword) {
      // The provided credentials match the guest credentials
      // You can sign in the user as a guest

      const sql = `
        SELECT "userId"
        FROM "Users"
        WHERE "username" = $1
      `;

      const result = await db.query(sql, [guestUsername]);

      if (result.rows.length === 0) {
        throw new ClientError(401, 'Guest user not found');
      }

      const user = result.rows[0];

      const payload = {
        userId: user.userId,
        username: guestUsername,
      };

      if (!process.env.TOKEN_SECRET) {
        throw new Error('TOKEN_SECRET environment variable is not defined');
      }

      const token = jwt.sign(payload, process.env.TOKEN_SECRET);

      res.status(200).json({
        token,
        payload,
      });
    } else {
      // Invalid credentials for guest sign-in
      throw new ClientError(401, 'Invalid guest credentials');
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Handles adding a movie to the user's watchlist.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the added watchlist item.
 * @throws {ClientError} if userId is undefined or idImdb is not provided.
 */
app.post('/api/watchlist', authMiddleware, async (req, res, next) => {
  try {
    const { idImdb } = req.body;

    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }
    const { userId } = req.user;

    if (!idImdb) {
      throw new ClientError(400, 'idImdb is a required field');
    }

    // Check if the movie is already in the watchlist for the user
    const checkWatchlistSql = `
      SELECT * FROM "WatchList"
      WHERE "userId" = $1 AND "idImdb" = $2
    `;
    const checkWatchlistParams = [userId, idImdb];
    const watchlistResult = await db.query(
      checkWatchlistSql,
      checkWatchlistParams
    );

    if (watchlistResult.rows.length > 0) {
      // Movie is already in the watchlist, no need to add again
      return res.status(200).json({ message: 'Movie already in watchlist' });
    }

    // Add the movie to the watchlist with the associated userId
    const addToWatchlistSql = `
      INSERT INTO "WatchList" ("userId", "idImdb")
      VALUES ($1, $2)
      RETURNING *
    `;
    const addToWatchlistParams = [userId, idImdb];
    const result = await db.query(addToWatchlistSql, addToWatchlistParams);
    const [watchlistItem] = result.rows;
    res.status(201).json(watchlistItem);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting the user's watchlist.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the user's watchlist.
 * @throws {ClientError} if userId is undefined or if the user has no films in their watchlist.
 */
app.get('/api/watchlist', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    // Retrieve all idImdb values from WatchList for the specific user
    const getWatchlistItemsSql = `
      SELECT "idImdb" FROM "WatchList"
      WHERE "userId" = $1
    `;
    const getWatchlistItemsParams = [userId];

    const watchlistResult = await db.query(
      getWatchlistItemsSql,
      getWatchlistItemsParams
    );

    if (watchlistResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "User doesn't have any films in watchlist" });
    }

    // Extract idImdb values from the result
    const idImdbList = watchlistResult.rows.map((row) => row.idImdb);

    res.status(200).json({ idImdbList });
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting rated films by the user.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the user's rated films.
 * @throws {ClientError} if userId is undefined or if the user hasn't rated any films.
 */
app.get('/api/idImdb/ratedFilms', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    const getRatedFilmsSql = `
      SELECT "idImdb", "userNote", "rating", "likes" FROM "RatedFilms"
      WHERE "userId" = $1
    `;
    const getRatedFilmsParams = [userId];

    const ratedFilmsResult = await db.query(
      getRatedFilmsSql,
      getRatedFilmsParams
    );

    if (ratedFilmsResult.rows.length === 0) {
      return res.status(404).json({ message: "User hasn't rated any films" });
    }

    const ratedFilms = ratedFilmsResult.rows;

    res.status(200).json(ratedFilms);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting the number of likes for a film.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the number of likes for the film.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the database.
 */
app.get('/api/likes/:idImdb/:userId', async (req, res, next) => {
  try {
    const { idImdb, userId } = req.params;

    // Query the database to count the likes for the given post
    const countLikesSql = `
      SELECT "likes" FROM "RatedFilms"
      WHERE "userId" = $1 AND "idImdb" = $2
    `;
    const countLikesParams = [userId, idImdb];
    const result = await db.query(countLikesSql, countLikesParams);

    if (result.rows.length === 0) {
      // No rows found, handle the case where the movie doesn't exist in 0 for likeCount
      res.status(200).json(0);
    } else {
      // Rows found, get the likeCount from the first row
      const likes = result.rows[0].likes;
      res.status(200).json(likes);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Handles incrementing the number of likes for a film.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the updated number of likes for the film.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the database.
 */
app.post('/api/likes/:idImdb/:userId', async (req, res, next) => {
  try {
    const { idImdb, userId } = req.params;
    const { likes: newLikes } = req.body; // Get newLikes from the request body

    // Check if the movie exists in the RatedFilms table
    const checkRatedFilmSql = `SELECT "likes" FROM "RatedFilms"
       WHERE "userId" = $1 AND "idImdb" = $2`;
    const checkRatedFilmParams = [userId, idImdb];
    const ratedFilmResult = await db.query(
      checkRatedFilmSql,
      checkRatedFilmParams
    );

    if (ratedFilmResult.rows.length === 0) {
      // Movie is not found in the RatedFilms, throw an error
      throw new ClientError(404, 'Movie not found in RatedFilms');
    }

    // Update the likes count in the RatedFilms table
    const updateLikesSql = `UPDATE "RatedFilms"
       SET "likes" = $1
       WHERE "userId" = $2 AND "idImdb" = $3
       RETURNING "likes"`;
    const updateLikesParams = [newLikes, userId, idImdb];
    const result = await db.query(updateLikesSql, updateLikesParams);

    if (result.rows.length === 0) {
      throw new ClientError(404, 'Failed to update likes');
    }

    // Return the updated like count
    res.status(200).json({ likes: newLikes });
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting the user's rated films.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the user's rated films.
 * @throws {ClientError} if userId is undefined or if the user hasn't rated any films.
 */
app.get('/api/Edit/ratedFilms', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    const getRatedFilmsSql = `
      SELECT * FROM "RatedFilms"
      WHERE "userId" = $1
    `;
    const getRatedFilmsParams = [userId];

    const ratedFilmsResult = await db.query(
      getRatedFilmsSql,
      getRatedFilmsParams
    );

    if (ratedFilmsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No Post from anyone!' });
    }

    const ratedFilms = ratedFilmsResult.rows;

    res.status(200).json(ratedFilms);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting rated films from all users.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to all rated films from all users.
 */
app.get('/api/Feed/ratedFilms', async (req, res, next) => {
  try {
    const getRatedFilmsSql = `
      SELECT * FROM "RatedFilms"
      ORDER BY "createdAt" ASC
    `;

    const ratedFilmsResult = await db.query(getRatedFilmsSql);

    if (ratedFilmsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No Post from anyone!' });
    }

    const ratedFilms = ratedFilmsResult.rows;

    res.status(200).json(ratedFilms);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting a user's rated film by idImdb.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the user's rated film by idImdb.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the user's rated films.
 */
app.get(
  '/api/Edit/ratedFilms/:idImdb',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { idImdb } = req.params;

      if (!req.user) {
        throw new ClientError(401, 'userId is undefined');
      }

      const { userId } = req.user;

      const getRatedFilmsSql = `
      SELECT "idImdb", "userNote", "rating", "likes" FROM "RatedFilms"
      WHERE "userId" = $1 and "idImdb" = $2
    `;
      const getRatedFilmsParams = [userId, idImdb];

      const ratedFilmsResult = await db.query(
        getRatedFilmsSql,
        getRatedFilmsParams
      );

      if (ratedFilmsResult.rows.length === 0) {
        return res.status(404).json({
          message:
            'you can note edit this post for this film because you never made a post',
        });
      }

      const ratedFilms = ratedFilmsResult.rows;

      res.status(200).json(ratedFilms);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Handles adding or updating the rating and user note for a film.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the updated rated film.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the database.
 */
app.post('/api/rating', authMiddleware, async (req, res, next) => {
  try {
    const { idImdb, rating, userNote } = req.body;

    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }
    const { userId } = req.user;

    if (!idImdb) {
      throw new ClientError(400, 'idImdb is a required field');
    }

    // Check if the movie is already in the ratedFilms for the user
    const checkWatchlistSql = `
      SELECT * FROM "RatedFilms"
      WHERE "userId" = $1 AND "idImdb" = $2
    `;
    const checkWatchlistParams = [userId, idImdb];
    const watchlistResult = await db.query(
      checkWatchlistSql,
      checkWatchlistParams
    );

    const currentTimestamp = new Date().toISOString();

    if (watchlistResult.rows.length > 0) {
      // Movie is already in the rated list, update the existing entry
      const updateRatingSql = `
        UPDATE "RatedFilms"
        SET "rating" = $1, "userNote" = $2, "updatedAt" = $3
        WHERE "userId" = $4 AND "idImdb" = $5
        RETURNING *
      `;
      const updateRatingParams = [
        rating,
        userNote,
        currentTimestamp,
        userId,
        idImdb,
      ];
      const updateResult = await db.query(updateRatingSql, updateRatingParams);
      const [updatedRatedItem] = updateResult.rows;
      return res.status(200).json(updatedRatedItem);
    }

    // Add the movie to the watchlist with the associated userId
    const addToRatedFilmsSql = `
        INSERT INTO "RatedFilms" ("userId", "idImdb", "rating", "userNote", "likes", "createdAt")
        VALUES ($1, $2, $3, $4, 0, $5)
        ON CONFLICT ("userId", "idImdb") DO NOTHING
        RETURNING *
    `;
    const addToRatedFilmsParams = [
      userId,
      idImdb,
      rating,
      userNote,
      currentTimestamp,
    ];

    console.log('addToRatedFilmsParams:  ', addToRatedFilmsParams);
    const result = await db.query(addToRatedFilmsSql, addToRatedFilmsParams);
    const [ratedItem] = result.rows;
    res.status(201).json(ratedItem);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles removing a film from the user's watchlist.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the watchlist.
 */
app.delete('/api/watchlist/:idImdb', authMiddleware, async (req, res, next) => {
  try {
    const { idImdb } = req.params;

    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }
    const { userId } = req.user;

    const sql = `
      DELETE FROM "WatchList" WHERE "idImdb" = $1 and "userId" = $2;
    `;

    await db.query(sql, [idImdb, userId]);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * Handles removing a film from the user's ratedFilms table.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the ratedFilms table.
 */
app.delete('/api/rated/:idImdb', authMiddleware, async (req, res, next) => {
  try {
    const { idImdb } = req.params;

    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }
    const { userId } = req.user;

    const sql = `
      DELETE FROM "RatedFilms" WHERE "idImdb" = $1 and "userId" = $2;
    `;

    await db.query(sql, [idImdb, userId]);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * Handles updating the rating and user note for a film.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the updated rated film.
 * @throws {ClientError} if userId is undefined or if the film doesn't exist in the rated films.
 */
app.put('/api/rated/:idImdb', authMiddleware, async (req, res, next) => {
  try {
    const { idImdb } = req.params;

    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }
    const { userId } = req.user;
    const { rating, userNote } = req.body;

    // Check if the movie is already in the ratedFilms for the user
    const checkRatedFilmSql = `
      SELECT * FROM "RatedFilms"
      WHERE "userId" = $1 AND "idImdb" = $2
    `;
    const checkRatedFilmParams = [userId, idImdb];
    const ratedFilmResult = await db.query(
      checkRatedFilmSql,
      checkRatedFilmParams
    );

    if (ratedFilmResult.rows.length === 0) {
      // Movie is not found in the ratedFilms, return an error
      throw new ClientError(404, 'Movie not found in ratedFilms');
    }

    // Update the rating and userNote for the movie in the ratedFilms
    const updateRatedFilmSql = `
      UPDATE "RatedFilms"
      SET "rating" = $1, "userNote" = $2
      WHERE "userId" = $3 AND "idImdb" = $4
      RETURNING *
    `;
    const updateRatedFilmParams = [rating, userNote, userId, idImdb];
    const result = await db.query(updateRatedFilmSql, updateRatedFilmParams);
    const [updatedRatedFilm] = result.rows;
    console.log('updatedRatedFilm', updatedRatedFilm);

    res.status(200).json(updatedRatedFilm);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles getting film details by idImdb.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the film details.
 * @throws {ClientError} if the film with the given idImdb is not found.
 */
app.get('/api/films/by-id/:idImdb', async (req, res, next) => {
  try {
    const { idImdb } = req.params;

    // Query the Films table to fetch film details by idImdb
    const sql = `
      SELECT * FROM "Films"
      WHERE "idImdb" = $1
    `;
    const result = await db.query(sql, [idImdb]);

    if (result.rows.length === 0) {
      // Film with the given idImdb not found
      throw new ClientError(404, 'Film not found');
    }

    const filmDetails = result.rows[0];
    res.status(200).json(filmDetails);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles adding a new film to the database.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise} A Promise that resolves to the added film details.
 */
app.post('/api/films', async (req, res, next) => {
  try {
    const {
      idImdb,
      filmTitle,
      genre,
      type,
      releaseYear,
      creator,
      description,
      generalRating,
      poster,
      trailer,
    } = req.body;

    // Insert the new film details into the Films table
    const sql = `
      INSERT INTO "Films" ("idImdb", "filmTitle", "genre", "type", "releaseYear", "creator", "description", "generalRating", "poster", "trailer")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      idImdb,
      filmTitle,
      genre,
      type,
      releaseYear,
      creator,
      description,
      generalRating,
      poster,
      trailer,
    ];
    const result = await db.query(sql, values);

    // Newly added film details
    const addedFilm = result.rows[0];

    res.status(201).json(addedFilm);
  } catch (err) {
    next(err);
  }
});

/**
 * Handles deleting a film from the database by idImdb.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 */
app.delete('/api/films/:idImdb', async (req, res, next) => {
  try {
    const idImdb = req.params.idImdb; // Get the idImdb from the URL parameter

    const sql = `
      DELETE FROM "Films" WHERE "idImdb" = $1;
    `;

    await db.query(sql, [idImdb]);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * A catch-all route to serve the React application's index.html.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

/**
 * Error handling middleware.
 * @param {Error} err - The error object.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 */
app.use(errorMiddleware);

// Start the server
app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
