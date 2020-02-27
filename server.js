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
  res.header("Access-Control-Allow-Origin", '*'); // TODO: change this! security risk
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

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

// For development: TESTING MAIN FUNCTION
app.get('/test', (req, res) => {
  let temp = req.query.x;

  const textBody = temp.split(" ");
  const code = textBody[0];
  const query = textBody.slice(1).join(" ");

  // two DB lookups then two Spotify API calls

  PlaylistCode.findOne({ code }, (err, doc) => {
    if (err) throw (err);
    if (doc === null) {
      console.log("ERROR: invalid code");
      return;
    }

    const playlist_id = doc.playlist_id;
    mongoose.connection.collection('sessions').findOne(
      { _id: doc.session_id }, (err, doc) => {
        if (err) throw (err);
        if (doc === null) {
          console.log("ERROR: session database error");
          return;
        }

        const session_data = JSON.parse(doc.session);
        const access_token = session_data.access_token;

        const url = "https://api.spotify.com/v1/search?" + 
          queryString.stringify({q: query, type: 'track', limit: 1});

        fetch(url, { headers: {Authorization: "Bearer " + access_token} })
          .then(res => res.json())
          .then(data => {
            if (data.err) throw (data.err);
            if (data.tracks.items.length === 0) throw new Error("No songs found");
            const track = data.tracks.items[0];
            console.log(data.tracks.items[0].name);
            addTrackToPlaylist(track.id, playlist_id, access_token, c => res.send(c));
          })
          .catch(err => {
            console.log(err);
            if (err.status === 401) {refreshToken(req, res)};
          });
      }
    );
  });

  addTrackToPlaylist = (track_id, playlist_id, access_token, callback) => {
    const add_url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?` +
      queryString.stringify({uris: `spotify:track:${track_id}`});

    const options = {
      method: "POST",
      headers: {Authorization: "Bearer " + access_token}
    }

    fetch(add_url, options) 
      .then(res => res.json())
      .then(data => {
        if (data.err) throw (data.err);
        callback(JSON.stringify({success: true}));
      })
      .catch(err => {
        console.log("adding track to playlist", JSON.stringify(err));
        if (err.status === 401) {refreshToken(req, res)};
      });
  }
});

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