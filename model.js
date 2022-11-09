const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true },
    email: String,
    password: String,
  },
  { collection: "users" }
);
const watchlistSchema = new mongoose.Schema(
  {
    userid:String,
    movieid:String
  },
  { collection: "watchlist" }
);
const movieSchema = new mongoose.Schema(
  {
    movie_name: String,
    release_date: String,
    boxoffice_collection: Number,
    cover_image: String,
    poster_image: String,
    trailer: String,
    avg_rating: String,
    category: Array,
  },
  { collection: "movies" }
);

const Movie = mongoose.model("Movie", movieSchema);
const User = mongoose.model("User", userSchema);
const Watchlist = mongoose.model("Watchlist", watchlistSchema);

// Exporting our model objects
module.exports = {
  User,
  Movie,
  Watchlist
};
