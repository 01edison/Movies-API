require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.LOCAL_HOST_MOVIES_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const moviesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: Array,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
});

moviesSchema.index({ "$**": "text" });

const Movie = new mongoose.model("Movie", moviesSchema);

// Movie.insertMany(movies);

/* GET movies */
app.get("/api/movies", function (req, res) {
  // set a limit to the number of returned movies
  let limit = parseInt(req.query.limit);
  let category = req.query.category;
  let q = req.query.q;

  if (!limit) {
    // set a limit of 5 movies returned if no limit is set
    limit = 5;
  }
  let query = {
    category: category,
  };
  // if universal query is given, then the query will be the universal query
  if (q) {
    query = { $text: { $search: q } };
  }
  Movie.find(query, function (err, movies) {
    return res.json(movies);
  }).limit(limit);
});

// End of GET movies

// POST new movie
app.post("/api/movies", function (req, res) {
  const newMovie = new Movie({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    thumbnail: req.body.thumbnail,
  });
  newMovie.save(function (err) {
    if (err) {
      return res.json({ message: "Error adding movie" });
    }
    return res.json({ message: "Movie added successfully" });
  });
});

// End of POST

app.put("/api/movies/:name", function (req, res) {
  let movieName = req.params.name;

  let newContent = req.body.content;
  let newName = req.body.name;

  Movie.replaceOne(
    { name: movieName },
    { name: newName, content: newContent },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        return res.json({ message: "Movie updated successfully" });
      }
    }
  );
});

// PATCH single Movie
app.patch("/api/movies/:name", function (req, res) {
  let movieName = req.params.name;

  let newName = req.body.name;

  Movie.updateOne({ name: movieName }, { name: newName }, function (err) {
    if (err) {
      return res.json({ message: "Error updating movie" });
    }
    return res.json({ message: "Movie updated successfully" });
  });
});

// DELETE single movie
app.delete("/api/movies/:id", function (req, res) {
  let paramID = req.params.id;

  Movie.deleteOne({ _id: paramID }, function (err) {
    if (err) {
      return res.json({ message: "Error deleting movie" });
    }
    return res.json({ message: "Movie deleted successfully" });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
