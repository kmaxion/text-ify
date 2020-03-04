const { Router } = require('express');
const fetch = require('node-fetch');

const router = Router();

router.get('/', (req, res) => {
  const url = "https://api.spotify.com/v1/me/player";

  fetch(url, { headers: { Authorization : 'Bearer ' + req.session.access_token } })
    .then(resp => {
      if (resp.statusText === 'No Content') return undefined;
      else return resp.json();
    })
    .then(data => {
      if (data === undefined) {
        return res.json("none");
      }

      else if (data.error) throw (data.error);
      else res.send(data);
    })
    .catch(err => {
      console.log("playback error: ", err);
      if (err.status === 401) refreshToken(req, res);
      else res.status(400).json("Fetching playback info failed");
    });
});

router.get('/devices', (req, res) => {
  const url = "https://api.spotify.com/v1/me/player/devices";

  fetch(url, { headers: { Authorization : 'Bearer ' + req.session.access_token } })
    .then(resp => resp.json())
    .then(data => {
      if (data.error) throw (data.error);
      res.send(data);
    })
    .catch(err => {
      console.log("playback/devices error:", JSON.stringify(err));
      if (err.status === 401) refreshToken(req, res);
      else res.status(400).json("Fetching devices info failed");
    });
});

router.post('/transfer', (req, res) => {
  const url = "https://api.spotify.com/v1/me/player";
  const options = {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + req.session.access_token },
    body: JSON.stringify({device_ids: [`${ req.body.device_id }`]})
  }
  
  fetch(url, options)
    .then(resp => {
      if (resp.status == 204) return res.json("true");
      else resp.json();
    })
    .then(data => {
      if (data.error) throw (data.error);
    })
    .catch(err => {
      res.status(400).json("false");
      console.log("playback/transfer error:", err);
      if (err.status === 401) refreshToken(req, res);
    });
})

module.exports = router;