const express = require ('express');
const queryString = require('query-string');
const fetch = require('node-fetch');
const path = require('path');
const { URLSearchParams } = require('url');
const { generateStr, getUserInfo } = require('../modules/helpers');

const PlaylistCode = require('../models/PlaylistCode');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/keys');

const SERVER_URL = process.env.NODE_ENV === 'production'
  ? "https://text-ify.herokuapp.com" 
  : "http://localhost:5000";
const REDIRECT_URI = SERVER_URL + "/auth/callback";

const router = express.Router();

// Redirect to Spotify OAuth2 Confirmation
router.get("/", (req, res) => {
  sess = req.session;
  const state = generateStr(16);
  sess.state = state;

  const scopes = 'user-read-private user-read-email user-read-playback-state streaming user-modify-playback-state playlist-modify-public user-read-playback-state';
  const url = "https://accounts.spotify.com/authorize?" +
    queryString.stringify({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      show_dialog: "true",
      scope: encodeURIComponent(scopes),
      state: state
    })

  res.redirect(url);
});

// Delete current user session and code associated to user playlist
router.get("/logout", (req, res) => {
  PlaylistCode.findOneAndDelete({code: req.session.code}, (doc) => {
  });

  req.session.destroy(() => {
    res.send({logout: true});
  });
})

// Return whether a user is logged in
router.get("/status", (req, res) => {
  res.send({
    login_status: (req.session.access_token ? true : false),
    token: req.session.access_token,
    code: req.session.code,
    playlist_id: req.session.playlist_id
  });
});

// Gets access token and refresh token and stores it in user session
router.get("/callback", (req, res) => {
  sess = req.session;

  if (req.query.error) {
    res.redirect(process.env.NODE_ENV === 'production' ? SERVER_URL : "http://localhost:3000");
    console.log("access denied");
    return;
  }

  if (req.query.state !== sess.state) {
    console.log("states don't match");
    return;
  }

  sess.state = null;

  const url = "https://accounts.spotify.com/api/token";
  const params = new URLSearchParams();
  params.append('grant_type', "authorization_code");
  params.append('code', req.query.code);
  params.append('redirect_uri', REDIRECT_URI);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + new Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: params
  }

  fetch(url, options)
    .then(res => res.json())
    .then(data => {
      sess.access_token = data["access_token"];
      sess.refresh_token = data["refresh_token"];
      sess.save();

      const code = generateStr(5);
      sess.code = code;
      
      var newCode = new PlaylistCode({access_token: sess.access_token, code});
      newCode.save((err, data) => {
        if (err) {
          console.log(err);
          return;
        }
      });

      getUserInfo(req, data => {
        sess.user_id = data.id;
        sess.save();
        res.sendFile(path.join(__dirname, "..", "pages/callback.html"));
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;