import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem } from 'reactstrap';

const PlaylistSelect = ({ playlists, onPlaylistSelect, closePlaylistSelect, statePlaylistSelect }) => {  
  if (!statePlaylistSelect) return <></>

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={closePlaylistSelect}></div>
      <div className="modal-close" onClick={closePlaylistSelect}></div>
      <div className="modal-content">
        <h3>Select a Playlist</h3>
        <ul className="list">
          <li className='list-item select' onClick={() => onPlaylistSelect('CREATE_NEW')} key='new'>
            <img className='playlist-img' src={require('../icons/add-playlist.png')} alt='playlist cover' />
            <p>Create new playlist</p>
          </li>
          {playlists.map(p => 
            <li className='list-item select' onClick={() => onPlaylistSelect(p.id, p.name)} key={p.id}>
              <img className='playlist-img' 
                src={p.images && p.images.length === 3 ? p.images[2].url : require('../icons/no-cover.png')} 
                alt='playlist cover' />
              <p>{p.name}</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
 
export default PlaylistSelect;