import 'dotenv/config';
import jwt from 'jsonwebtoken';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYXV0b2RpZGFjdCIsImlhdCI6MTYwODE1NjM4Nn0.w9mORRpJ6Twlwr1pMdILyNqOyz7Auh8_rzcRUsexvy8';

try {
  if (process.env.TOKEN_SECRET) {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(payload);
  }
  console.error('TOKEN_SECRET is not defined.');
} catch (err) {
  console.error(err);
}
