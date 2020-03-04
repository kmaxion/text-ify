const { Router } = require('express');
const PlaylistCode = require('../models/PlaylistCode');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const queryString = require('query-string');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const router = Router();


// HANDLE RECEIVING TWILIO TEXT
router.post('/receive', (req, res) => {
  const textBody = req.body.Body.split(" ");
  const code = textBody[0];
  const query = textBody.slice(1).join(" ");

  PlaylistCode.findOne({ code }, (err, doc) => {
    if (err) throw (err);
    if (doc === null) {
      console.log("ERROR: invalid code");

      const reply = new MessagingResponse();
      reply.message('Invalid code. Song was not added to the playlist.');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(reply.toString());

      return;
    }

    const playlist_id = doc.playlist_id;
    const access_token = doc.access_token;

    searchTrack(query, playlist_id, access_token);
  });

  addTrackToPlaylist = (track_id, playlist_id, track_name, access_token, callback) => {
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
        const reply = new MessagingResponse();
        reply.message(`Successfully added ${track_name} to the playlist!`);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(reply.toString());

        callback(JSON.stringify({success: true}));
      })
      .catch(err => {
        console.log("adding track to playlist", JSON.stringify(err));
        if (err.status === 401) {refreshToken(req, res)};
      });
  }

  searchTrack = (query, playlist_id, access_token) => {
    const url = "https://api.spotify.com/v1/search?" + 
            queryString.stringify({q: query, type: 'track', limit: 1});
  
    fetch(url, { headers: {Authorization: "Bearer " + access_token} })
      .then(res => res.json())
      .then(data => {
        if (data.err) throw (data.err);
        if (data.tracks.items.length === 0) {             
          const reply = new MessagingResponse();
          reply.message('Song could not be found.');
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(reply.toString());
  
          throw new Error("No songs found");
        }
        const track = data.tracks.items[0];
        addTrackToPlaylist(track.id, playlist_id, track.name, access_token, c => res.send(c));
      })
      .catch(err => {
        console.log(err);
        if (err.status === 401) {refreshToken(req, res)};
      });
  }
});

module.exports = router;

