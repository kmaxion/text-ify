const express = require('express');
const fetch = require('node-fetch');

const { getUserInfo } = require('../modules/helpers');
const router = express.Router();

router.get('/info', (req, res) => {
    getUserInfo(req, data => {
      res.send(data);
    });
  }
);

module.exports = router;