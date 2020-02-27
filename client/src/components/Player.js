import React from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';

const Player = ({ token, transferPlayback }) => {
  return (
    <div className="navbar is-fixed-bottom">
      <SpotifyPlayer 
        callback={(state) => {
          console.log(state);
        }}
        token={token}
        autoPlay={true}
        persistDeviceSelection={true}
      />
    </div>
  );
}
 
export default Player;