var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');
const { User, Movie, Watchlist } = require("./model.js");

var app = express();

const port = process.env.PORT || 8000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());





mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.rqpu9td.mongodb.net/movie-rating?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", mongoConnected);

function mongoConnected() {
  // Reset Password
  

  app.get("/resetpassword/:email", (req, res) => {
    function generateOTP(){
      var otp=0;
      for(let i=0;i<6;i++)
      {
        otp = (otp*10) + Math.floor(Math.random()*9);
      }
      return otp;
    }
    var randomotp = generateOTP();
    console.log(randomotp);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'movierating420@gmail.com',
        pass: 'usuxvvyfduibptxq'
      }
    });
    var mailOptions = {
      from: 'movierating420@gmail.com',
      to: req.params.email,
      subject: 'Change Password Request',
      text: 'You have requested to change your password, In order to reset the existing password from the website enter the given otp to validate yourself: '+randomotp
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ "status": "failure"});
      } else {
        return res.json({"otp":randomotp,"status":"success"});
      }
    });
  });

  // movie collection starts
  app.get("/movies", (req, res) => {
    Movie.find({}, { _id: 1, __v: 0 }, (err, movies) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      if (movies && movies.length == 0) {
        return res.status(400).json({ error: "No records found!" });
      }
      return res.status(200).json(movies);
    });
  });

  app.get("/movie/:movie_name", (req, res) => {
    Movie.find(
      { movie_name: new RegExp("^" +req.params.movie_name, 'i') },
      { _id: 0, __v: 0 },
      (err, movie) => {
        if (err) {
          return res.json({ error: "Movie not found!" });
        }
        if (movie && movie.length == 0) {
          return res.json({ error: "No records found!" });
        }
        return res.status(200).json(movie);
      }
    );
  });
  app.post("/watchlist", (req, res) => {
    var newWatchlist = new Watchlist(req.body);
    newWatchlist.save(function (err, result) {
      if (err) return res.json({ status: "error", data: err });
      return res.json({ status: "ok", data: result });
    });
  });
  app.get("/watchlist/:userid", (req, res) => {
    Watchlist.find(
      { userid: req.params.userid},
      { _id: 0, __v: 0 },
      (err, movie) => {
        if (err) {
          return res.json({ status: "error", error: err });
        }
        if (movie && movie.length == 0) {
          return res.json({ status: "error", error: err });
        }
        return res.status(200).json(movie);
      }
    );
  });
  app.get("/watchlist/:userid/:movieid", (req, res) => {
    Watchlist.find(
      { userid: req.params.userid,movieid:req.params.movieid},
      { _id: 0, __v: 0 },
      (err, movie) => {
        if (err) {
          return res.json({ status: "error", error: err });
        }
        if (movie && movie.length == 0) {
          return res.json({ status: "error", error: err });
        }
        return res.status(200).json(movie);
      }
    );
  });
  app.delete("/watchlist/delete/:objectid", (req, res) => {
    Watchlist.deleteOne({ movieid: req.params.objectid }, function (err, result) {
      if (err)
        return res.json({ status: "error", data: err });
      return res.json({ status: "ok", data: result });
    });
  });

  app.get("/movie/id/:id", (req, res) => {
    Movie.find({ _id: req.params.id }, { __v: 0 }, (err, movie) => {
      if (err) {
        return res.status(400).json({ error: "Movie not found!" });
      }
      if (movie && movie.length == 0) {
        return res.status(400).json({ error: "No records found!" });
      }
      return res.status(200).json(movie);
    });
  });

  app.delete("/movie/delete/:id", (req, res) => {
    Movie.deleteOne({ _id: req.params.id }, function (err, result) {
      if (err) return res.status(400).json({ error: err });
      return res.status(200).json({ result });
    });
  });

  app.delete("/movies/delete", (req, res) => {
    Movie.deleteMany({}, function (err, result) {
      if (err) return res.status(400).json({ error: err });
      return res.status(200).json({ result });
    });
  });

  app.post("/movie", (req, res) => {
    var newMovie = new Movie(req.body);
    newMovie.save(function (err, result) {
      if (err) return res.status(400).json({ err });
      return res.status(200).json({ result });
    });
  });

  app.put("/movie/update/:id", async (req, res) => {
    const rating = req.body.avg_rating;
    const count = req.body.rating_counts;
    try {
      const result = await Movie.updateOne(
        { _id: req.params.id },
        { $set: { avg_rating: rating, rating_counts: count } }
      );
      return res.json({ status: "ok", data: result });
    } catch (error) {
      res.json({ status: "error", error: error });
    }
  });
  // movie collection ends

  // users collection starts

  // getting all users
  app.get("/users", (req, res) => {
    User.find({}, (err, users) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      if (users && users.length == 0) {
        return res.status(400).json({ error: "No records found!" });
      }
      return res.status(200).json(users);
    });
  });

  // getting specific user by username
  app.get("/user/:username", (req, res) => {
    User.find({ username: req.params.username }, (err, users) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      if (users && users.length == 0) {
        return res.status(400).json({ error: "No records found!" });
      }
      return res.status(200).json(users);
    });
  });

  // getting specific user by _id
  app.get("/user/id/:id", (req, res) => {
    User.find({ _id: req.params.id }, (err, users) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      return res.status(200).json(users[0]);
    });
  });

  // posting user to db
  app.post("/user", (req, res) => {
    let user = new User(req.body);
    user.save(function (err, result) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      return res.status(200).json({ result });
    });
  });

  // deleting user by username
  app.delete("/user/delete/:username", (req, res) => {
    User.deleteOne({ username: req.params.username }, (err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      return res.status(200).json({ result });
    });
  });

  // updating user password
  app.put("/user/:username", (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      req.body,
      { useFindAndModify: false },
      (err, result) => {
        if (err)
          return res.json({ status: "error", data: err });
        return res.json({ status: "ok", data: result });
      }
    );
  });
  app.put("/user/email/:email", (req, res) => {
    console.log(req.params.email);
    console.log(req.body);
    User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { useFindAndModify: false },
      (err, result) => {
        if (err)
          return res.json({ status: "error", data: err });
        return res.json({ status: "ok", data: result });
      }
    );
  });

  // user register
  app.post("/register-user", (req, res) => {
    let user = new User(req.body);
    const username = user.username;
    user.save(function (err, result) {
      if (err) {
        return res.json({ status: "error", error: err });
      }
      return res.json({ status: "ok", data: result });
    });
    // User.findOne({ username }, (err, user) => {
    //   if (err) {
    //     return res.json({ status: "error", error: err });
    //   }
    //   if (user) {
    //     return res.json({
    //       status: "error",
    //       error: "Username is already taken. Please select another username.",
    //     });
    //   }
    //   User.create({
    //     name: user.name,
    //     username: user.username,
    //     email: user.email,
    //     password: user.password,
    //   });
    //   return res.json({ status: "ok" });
    // });
  });

  // user login
  app.post("/login-user", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username }, (err, user) => {
      if (err) {
        return res.json({ status: "error", error: err });
      }
      if (!user) {
        return res.json({ status: "error", error: "User not found" });
      }
      if (password === user.password) {
        const token = user._id;
        if (res.status(201)) {
          return res.json({ status: "ok", data: token });
        } else {
          return res.json({ status: "error" });
        }
      }
      res.json({ status: "error", error: "Invalid Password" });
    });
  });
  // users collection ends

  // review collection starts
  app.post("/review", (req, res) => {
    var review = new Review(req.body);
    review.save(function (err, result) {
      if (err) return res.json({ status: "error", error: err });
      return res.json({ status: "ok", data: result });
    });
  });

  // getting all reviews by id
  app.get("/reviews/:movieid", (req, res) => {
    Review.find(
      { movieid: req.params.movieid },
      { _id: 1, __v: 0 },
      (err, reviews) => {
        if (err) {
          return res.status(400).json({ status: "error", error: err });
        }
        if (reviews && reviews.length == 0) {
          return res.json({ status: "No records" });
        }
        return res.json({ status: "ok", data: reviews });
      }
    );
  });

  // review collection ends
}
app.listen(port, function (err) {
  if (err) console.log("Error in server setup");
  else console.log("Server listening on Port", port);
});
