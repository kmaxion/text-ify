import React from 'react';

const Track = ({ album_img, name, artist }) => { 
  return (
    <div>
      <img src={album_img} alt="album cover"></img>
      <p><strong>{name}</strong></p>
      <p>{artist}</p>
    </div>
  );
}
 
export default Track;