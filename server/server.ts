import 'dotenv/config';
import pg from 'pg';
import argon2 from 'argon2';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware } from './lib/index.js';

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
app.use(express.json());

app.get('/', (req, res) => {
  res.send(
    'Welcome to your API. Use the /api/auth/sign-up and /api/auth/sign-in endpoints.'
  );
});

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

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
