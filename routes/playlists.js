const { Router } = require('express');
const fetch = require('node-fetch');
const { generateStr, createPlaylist } = require('../modules/helpers');
const PlaylistCode = require('../models/PlaylistCode');

const { refreshToken } = require('../modules/helpers');
const router = Router();

// Requests all of user's playlists from Spotify
router.get('/all', (req, res) => {
  const url = `https://api.spotify.com/v1/users/${req.session.user_id}/playlists`;

  fetch(url, { headers: { Authorization: "Bearer " + req.session.access_token } })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw (data.error);
      res.send(data);
    })
    .catch(err => {
      console.log("playlists/all:", JSON.stringify(err));
      if (err.status === 401) refreshToken(req, res);
    });
});

// Requests a specific playlist from Spotify
router.get('/one/:playlist_id', (req, res) => {
  const playlist_id = req.params.playlist_id;
  const url = `https://api.spotify.com/v1/playlists/${playlist_id}`;

  fetch(url, {headers: {Authorization: "Bearer " + req.session.access_token}})
    .then(res => res.json())
    .then(data => {
      if (data.error) throw (data.error);
      res.send(data);
    })
    .catch(err => {
      console.log("playlists/one/:playlist_id:", JSON.stringify(err));
      if (err.status === 401) refreshToken(req, res);
    });
});

// Associates the given playlist with user's text code in database
router.post("/assign/:playlist_id", (req, res) => {
  update = (playlist_id) => {
    PlaylistCode.findOneAndUpdate(
    {access_token: req.session.access_token}, { playlist_id }, {new: true}, (err, doc) => {
      if (err) throw (err);
      req.session.playlist_id = doc.playlist_id;
      res.status(200).send(JSON.stringify({code: doc.code, playlist_id: doc.playlist_id}));
    });
  }

  if (req.params.playlist_id === "CREATE_NEW") {
    createPlaylist(req, data => {
      update(data.id);
    })
  }

  else playlist_id = update(req.params.playlist_id);
})

router.get('/play', (req, res) => {
  console.log("play requested");
  const playlist_id = req.query.playlist_uri;
  const offset = req.query.offset;

  const url = 'https://api.spotify.com/v1/me/player/play';

  const options = {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + req.session.access_token },
    body: JSON.stringify({
      "context_uri": `${ playlist_id }`,
      "offset": { position: `${offset}` }  
    })
  }

  fetch(url, options)
    .then(r => {
      res.send(r);
      return r;
    })
    .catch(err => console.log("PLAY: " + err));
});

module.exports = router;