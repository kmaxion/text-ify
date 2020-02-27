const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('../config/keys');
const PlaylistCode = require('../models/PlaylistCode');
const fetch = require('node-fetch');

module.exports = {
  // Generates a random string of letters with length (len)
  generateStr: (len) => {
    var result = '';
    var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < len; i++) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  },

  // Gets user information from Spotify
  getUserInfo: (req, callback) => {
    fetch("https://api.spotify.com/v1/me",
    { headers: { Authorization: "Bearer " + req.session.access_token } })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw (data.error);
      callback(data);
    })
    .catch(err => {
      console.log("/user/info:", JSON.stringify(err));
      if (err.status === 401) {refreshToken(req, res)};
    });
  },

  // Gets a new access token using the refresh token and stores it in the user session
  refreshToken: (req, res) => {
    console.log("Refreshing token...");
    console.log(req.session.refresh_token);
    
    const url = "https://accounts.spotify.com/api/token";
  
    const params = new URLSearchParams();
    params.append('grant_type', "refresh_token");
    params.append('refresh_token', req.session.refresh_token);
  
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
        if (data.error) throw (data);
        PlaylistCode.findOne({access_token: req.session.access_token}, (err, doc) => {
          if (err) {
            console.log(err);
            return;
          }
          
          console.log(doc);
          doc.access_token = data["access_token"];
          doc.save();
        })
        req.session.access_token = data["access_token"];
        req.session.save()
        console.log("Access token refreshed");
      })
      .catch(err => console.log(err));
  },

  // Add a new playlist to user's Spotify account
  createPlaylist: (req, callback) => {
    console.log("creating playlist");
    const url = `https://api.spotify.com/v1/users/${req.session.user_id}/playlists`;
    let postBody = {
      name: new Date().toDateString(),
      description: 'Created by text-ify web app'
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.session.access_token
      },
      body: JSON.stringify(postBody)
    };

    fetch(url, options)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw (data.error);
        console.log('new playlist:', data);
        callback(data);
      })
      .catch(err => {
        console.log("playlists/create", JSON.stringify(err));
        if (err.status === 401) refreshToken(req, res);
      });
    }
}