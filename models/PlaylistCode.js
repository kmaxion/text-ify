const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistCodeSchema = new Schema({
  access_token: {type: String, required: true},
  code: {type: String, required: true},
  playlist_id: {type: String}
});

const PlaylistCode = mongoose.model("PlaylistCode", playlistCodeSchema);

module.exports = PlaylistCode;