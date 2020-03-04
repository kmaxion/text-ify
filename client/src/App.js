import React, { Component } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';
import AppNavbar from './components/AppNavbar.js';
import Login from './components/Login.js';
import Playlist from './components/Playlist.js';
import PlaylistTitle from './components/PlaylistTitle.js';
import PlaylistSelect from './components/PlaylistSelect.js';
import Instructions from './components/Instructions';
import Info from './components/Info';
import { detect } from 'detect-browser';

import './App.sass';

const browser = detect();

class App extends Component {
  state = {
    login_status: false,
    statePlaylistSelect: true,
    playlist_id: '',
    playlist_name: '',
    code: '',
    currentDevice : '',
    token: '',
    playlists: [],
    playlist_uri: '',
    playing: undefined
  }

  componentDidMount() {
    this.checkStatus();
  }

  onPlay = (index) => {
    if (index === undefined) return;
    this.setState({ playing: Number(index) });

    fetch(`/playlists/play?playlist_uri=${this.state.playlist_uri}&offset=${index}`, { credentials: 'include' })
      .then(res => {})
      .catch(err => console.log(err));
  }

  loadPlayer = (token) => {
    return (
      <div style={{"margin-top":"30px"}} className="navbar is-fixed-bottom">
        <SpotifyPlayer 
          callback={(state) => {
            console.log(state);
            if (this.state.currentDevice === '') {
              this.transferPlayback(state.deviceId);
            }
            this.getCurrentPlayback();
          }}
          token={token}
          autoPlay={true}
          persistDeviceSelection={true}
        />
      </div>
    )
  }

  checkStatus = () => {
    fetch("/auth/status", {credentials: 'include'})
    .then(res => res.json())
    .then(data => {
      let show = false;
      if (!data.playlist_id || data.playlist_id === '') show = true;

      this.setState({ 
        login_status: data["login_status"],
        playlist_id: data["playlist_id"],
        code: data["code"],
        token: data["token"],
        statePlaylistSelect: show
      });

      if (this.state.login_status) {
        this.getPlaylists();
        this.getCurrentPlayback();
      }
    })
    .catch(err => console.log(err));
  }

  setPlaylistName = (playlist_name) => {
    this.setState({ playlist_name });
  }

  setPlaylistURI = (playlist_uri) => {
    this.setState({ playlist_uri });
  }

  getCurrentPlayback = () => {
    console.log("getCurrentPlayback called");
    fetch("/playback", {credentials: 'include'})
    .then(res => res.json())
    .then(data => {
      console.log('currentPlayback:', data);
      this.setState({currentDevice: !data.device ? '' : data.device.name});
      this.setState({})
    })
    .catch(err => console.log(err));
  }

  assignPlaylist = (playlist_id) => {
    fetch(`/playlists/assign/${playlist_id}`, {method: 'POST', credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({
          code: data.code,
          playlist_id: data.playlist_id,
          statePlaylistSelect: false
        });
      })
      .catch(err => console.log(err));
  }

  transferPlayback = (device_id) => {
    fetch(`/playback/transfer`, {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'},
      credentials: 'include', 
      body: JSON.stringify({ device_id: device_id })}
    )
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data) {
          this.getCurrentPlayback();
        }
      })
      .catch(err => console.log(err));
  }

  getPlaylists = () => {
    fetch("/playlists/all", {credentials: 'include'})
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({playlists: data.items});
    })
    .catch(err => console.log(err)); 
  }

  onPlaylistSelect = (id) => {
    this.assignPlaylist(id);
  };

  onDeviceSelect = (e) => {
    if (e.target.dataset.value === undefined) {
      console.log('no device clickd');
      return;
    }

    this.transferPlayback(e.target.dataset.value);
  }

  togglePlaylistSelect = (e) => {
    this.getPlaylists();
    this.setState({statePlaylistSelect: !this.state.statePlaylistSelect});
  }

  render() {
    console.log(browser);
      return (
      <div className="App">
        <AppNavbar status={this.state.login_status} code={this.state.code} checkStatus={this.checkStatus}/>
        {this.state.login_status
          ? 
            <div className="container">
              <div className="columns">
                <div style={{"padding-bottom":"0px"}} className="column container is-half center">
                  <PlaylistTitle togglePlaylistSelect={this.togglePlaylistSelect} playlist_name={this.state.playlist_name} />
                </div>
                <div style={{"padding-bottom":"0px"}} className="column"></div>
              </div>
              <div className="columns">
              <p>{browser.name} {browser.os}</p>
                <div style={{"padding-top":"0px"}} className="column container is-half center">
                  <Playlist 
                    onPlay={this.onPlay}
                    playing={this.state.playing}
                    togglePlaylistSelect={this.togglePlaylistSelect} 
                    setPlaylistName={this.setPlaylistName}
                    setPlaylistURI={this.setPlaylistURI}
                    playlist_id={this.state.playlist_id}
                  />
                </div>
                <div style={{"padding-top":"0px", "margin-bottom":"50px"}} className="column container is-offset-1">
                  <Instructions code={this.state.code} />
                  {/*<Info currentDevice={this.state.currentDevice} onDeviceSelect={this.onDeviceSelect}/>*/}
                </div>
                <PlaylistSelect 
                  playlists={this.state.playlists}
                  statePlaylistSelect={this.state.statePlaylistSelect} 
                  closePlaylistSelect={this.togglePlaylistSelect}
                  onPlaylistSelect={this.onPlaylistSelect} 
                />
              </div>
            </div>
          : <div className="section container center">
              <Login checkStatus={this.checkStatus}/>
            </div>}
            {this.state.token !== '' && this.state.token !== undefined 
              ? this.loadPlayer(this.state.token)
              : <></>
            }
      </div>
    );
  }
}

export default App;