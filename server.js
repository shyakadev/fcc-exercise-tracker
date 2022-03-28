const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})
require('dotenv').config()
const mongoose = require('mongoose')
const mongoUri = process.env.MONGO_URI
mongoose.connect(mongoUri)
const connection = mongoose.connection;
connection.on("error", (err) => {
  console.log("Connection Error: " + err);
})
connection.once("open", () => console.log("Successfully connected to DB"))

const userSchema = new mongoose.Schema({
  username: String
})
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  _id: String
})
const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema)

app.use(cors())
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post("/api/users", urlencodedParser, async function (req, res) {
  const user = new User({
    username: req.body.username
  })
  const createdUser = await user.save()
  res.json({username: createdUser.username, _id: createdUser._id.toString()})
})
app.get("/api/users", async function(req, res) {
  const users = (await User.find()).map(user => {
    return {
      _id: user._id.toString(),
      username: user.username,
      __v: user.__v
    }
  })
  res.json(users)
})
app.post("/api/users/:_id/exercises", urlencodedParser, async function (req, res){
  const userId = req.params._id
  let date = new Date(req.body.date ? req.body.date : new Date()).toLocaleDateString("en-CA")
  const exercise = new Exercise({
    _id: userId,
    description: req.body.description,
    duration: req.body.duration,
    date: date
  })
  const createExercise = await exercise.save()
  const user = await User.findOne({_id: userId})
  res.json({_id: userId, username: user.username, date: createExercise.date, duration: createExercise.duration, description: createExercise.description})
})
app.get("/api/users/:_id/logs", async function(req, res){
  // TODO: retrieve a full exercise log of any user, return user object with a count property representing the number of exercises that belong to that user
  // TODO: return a log array of all the exercises added, each item should have a description, duration, and date properties
  // TODO: description should be string, duration should be a number, date should be a string using the dataString format of the Date API.
  // TODO: add from, to and limit parameters to retrieve part of the log user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
