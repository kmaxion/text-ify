require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo')(session);

const auth = require('./routes/auth');
const playlists = require('./routes/playlists');
const user = require('./routes/user');
const sms = require('./routes/sms');
const playback = require('./routes/playback');

const queryString = require('query-string');
const fetch = require('node-fetch');
const PlaylistCode = require('./models/PlaylistCode');

const app = express();

// Set up middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*'); 
    next();
  });
}

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, 
  {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log("Connected to Mongo"))
    .catch((err) => console.log(err));

// Enable sessions and use MongoDB as session store
app.use(session({
  secret: process.env.SESSION_SECRET, 
  store: new MongoStore({ mongooseConnection: mongoose.connection }), 
  saveUninitialized: true, 
  resave: false}
));

// Route to corresponding routes
app.use('/auth', auth);
app.use('/playlists', playlists);
app.use('/user', user);
app.use('/sms', sms);
app.use('/playback', playback)

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening to port ${port}`));