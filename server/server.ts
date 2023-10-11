import 'dotenv/config';
import pg from 'pg';
import argon2 from 'argon2';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';

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
      INSERT INTO "Users" ("username", "hashedPassword")
      VALUES ($1, $2)
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

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(401, 'invalid login');
    } else {
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

      const payload = {
        userId: user.userId,
        username,
      };

      if (!process.env.TOKEN_SECRET) {
        throw new Error('TOKEN_SECRET environment variable is not defined');
      }

      const token = jwt.sign(payload, process.env.TOKEN_SECRET);

      res.status(200).json({
        token,
        payload,
      });
    }
  } catch (err) {
    next(err);
  }
});

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

app.get('/api/idImdb/ratedFilms', authMiddleware, async (req, res, next) => {
  try {
    if (req.user === undefined) {
      throw new ClientError(401, 'userId is undefined');
    }

    const { userId } = req.user;

    // Retrieve all idImdb values from WatchList for the specific user
    const getWatchlistItemsSql = `
      SELECT "idImdb" FROM "RatedFilms"
      WHERE "userId" = $1
    `;
    const getWatchlistItemsParams = [userId];

    const watchlistResult = await db.query(
      getWatchlistItemsSql,
      getWatchlistItemsParams
    );

    if (watchlistResult.rows.length === 0) {
      return res.status(404).json({ message: "User haven't rated any films" });
    }

    // Extract idImdb values from the result
    const idImdbList = watchlistResult.rows.map((row) => row.idImdb);

    res.status(200).json({ idImdbList });
  } catch (err) {
    next(err);
  }
});

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

    if (watchlistResult.rows.length > 0) {
      // Movie is already in the ratedList, no need to add again
      return res.status(200).json({ message: 'Movie already in watchlist' });
    }

    // Add the movie to the watchlist with the associated userId
    const addToWatchlistSql = `
      INSERT INTO "RatedFilms" ("userId", "idImdb", "rating", "userNote")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const addToWatchlistParams = [userId, idImdb, rating, userNote];
    const result = await db.query(addToWatchlistSql, addToWatchlistParams);
    const [ratedItem] = result.rows;
    res.status(201).json(ratedItem);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/watchlist/:idImdb', async (req, res, next) => {
  try {
    const { idImdb } = req.params;

    const sql = `
      DELETE FROM "WatchList" WHERE "idImdb" = $1;
    `;

    await db.query(sql, [idImdb]);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

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
      trailer,
    } = req.body;

    // Insert the new film details into the Films table
    const sql = `
      INSERT INTO "Films" ("idImdb", "filmTitle", "genre", "type", "releaseYear", "creator", "description", "trailer")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
