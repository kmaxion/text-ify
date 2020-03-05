import React, { Component } from 'react';
import Track from './Track';

class Playlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    }

    this.playDisabled = false;
    this.pollID = null;
  }

  getData = () => {
    if (this.props.playlist_id === '' || this.props.playlist_id === undefined) {
      this.props.setPlaylistName("No playlist selected");
      this.props.setPlaylistURI("");
      return;
    }

    fetch(`/playlists/one/${this.props.playlist_id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        this.setState({
          tracks: data.tracks.items
        });
        
        this.props.setPlaylistURI(data.uri);
        this.props.setPlaylistName(data.name);
        })
      .catch(err => console.log(err));

    this.pollID = setTimeout(this.getData.bind(this), 60000);
  }

  componentDidMount() {
    if (this.props.playlist_id !== '') this.getData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.playlist_id !== this.props.playlist_id) {
        clearTimeout(this.pollID);
        this.getData();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.pollID);
  }

  isSelected = (index) => {
    if (index === this.props.playing) return "select list-item";
    return "select pointer list-item";
  }

  render() { 
    return (
        <React.Fragment>
          {this.props.playlist_id !== ''   
            ? <div className="list" id="playlist">
              {this.state.tracks.length !== 0  
                ? this.state.tracks.map((obj, index) => 
                  <div
                    onClick={() => this.props.onPlay(index)}
                    className={"select pointer list-item"}
                    key={index} 
                    data-value={index}
                  >
                    <Track 
                      name={obj.track.name} 
                      offset={index}
                      artist={obj.track.artists[0].name} 
                      album_img={obj.track.album.images[2].url}>
                    </Track>
                  </div>
                )
                : <div className="list-item" key="lonely boi">Playlist is empty. Start adding songs!</div>
              }
            </div>
            : <></>
          }
        </React.Fragment>
    );  
  }
}
 
export default Playlist;