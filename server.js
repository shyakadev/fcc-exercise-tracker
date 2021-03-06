const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri);
const connection = mongoose.connection;
connection.on("error", (err) => {
  console.log("Connection Error: " + err);
});
connection.once("open", () => console.log("Successfully connected to DB"));

const userSchema = Schema({
  _id: Schema.Types.ObjectId,
  username: String,
  exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
});
const exerciseSchema = Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  description: String,
  duration: Number,
  date: String,
});
const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

const getUserExercises = async (userId, query) => {
  const { from, to, limit } = query;
  const exercises = await User.findOne({ _id: userId }).populate({
    path: "exercises",
    perDocumentLimit: limit,
    match: { date: { $gte: from, $lte: to } },
  });
  return {
    username: exercises.username,
    count: exercises.exercises.length,
    _id: exercises._id,
    log: exercises.exercises.map((exercise) => {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString().toString(),
      };
    }),
  };
};

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", urlencodedParser, async function (req, res) {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
  });
  const createdUser = await user.save();
  res.json({ username: createdUser.username, _id: createdUser._id.toString() });
});

app.get("/api/users", async function (req, res) {
  const users = (await User.find()).map((user) => {
    return {
      _id: user._id.toString(),
      username: user.username,
      __v: user.__v,
    };
  });
  res.json(users);
});

app.post(
  "/api/users/:_id/exercises",
  urlencodedParser,
  async function (req, res) {
    const userId = req.params._id;
    let date = new Date(
      req.body.date ? req.body.date : new Date()
    ).toLocaleDateString("en-CA");
    const user = await User.findOne({ _id: userId });
    const exercise = new Exercise({
      user: userId,
      description: req.body.description,
      duration: req.body.duration,
      date: date,
    });
    exercise.save();
    if (Array.isArray(user.exercises)) user.exercises.push(exercise);
    const addExercise = await user.save();
    res.json({
      username: addExercise.username,
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString().toString(),
      _id: addExercise._id.toString(),
    });
  }
);

app.get("/api/users/:_id/logs", async function (req, res) {
  const from = req.query.from
    ? req.query.from
    : new Date(0).toLocaleDateString("en-CA").toString();
  const to = req.query.to
    ? req.query.to
    : new Date().toLocaleDateString("en-CA").toString();
  const limit = req.query.limit ? req.query.limit : 10;
  const query = { from: from, to: to, limit: limit };
  const userId = req.params._id;
  res.json(await getUserExercises(userId, query));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
