import React from 'react';

const PlaylistTitle = ({ playlist_name, togglePlaylistSelect }) => {
  return (
    <div className="level">
            <h3 className="level-left"><strong>{playlist_name}</strong></h3>
            <button className="button is-small level-right" onClick={togglePlaylistSelect}>switch playlist</button>
    </div>
  );
}

export default PlaylistTitle;