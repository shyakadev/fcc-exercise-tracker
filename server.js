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
  date: Date,
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
  // TODO: create a new user with form data username and the returned response will be an object with username and _id properties
  const user = new User({
    username: req.body.username
  })
  const createdUser = await user.save()
  res.json({username: createdUser.username, _id: createdUser._id.toString()})
})
app.get("/api/users", async function(req, res) {
  // TODO: Get a list of all users in an array form, each returned element should be an object literal containing a user's username and _id
})
app.post("/api/users/:_id/exercises", urlencodedParser, async function (req, res){
  // TODO: create exercises on user's _id with form data <description,duration,date?||current_date>
  // TODO: the returned response will be the user object with the exercise fields added
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
