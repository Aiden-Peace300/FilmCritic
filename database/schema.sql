set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "public"."Users" (
  "userId" serial PRIMARY KEY,
  "username" text not null,
  "hashedPassword" text not null,
  "createdAt" timestamptz(6) not null default now()
);

CREATE TABLE "public"."RatedFilms" (
  "userId" integer not null,
  "idImdb" text not null,
  "rating" float not null,
  "userNote" text not null,
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
  "trailer" text not null
);

ALTER TABLE "WatchList" ADD FOREIGN KEY ("idImdb") REFERENCES "Films" ("idImdb");

ALTER TABLE "RatedFilms" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("userId");

ALTER TABLE "WatchList" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("userId");

ALTER TABLE "RatedFilms" ADD FOREIGN KEY ("idImdb") REFERENCES "Films" ("idImdb");
