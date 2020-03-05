import React, { Component } from 'react';
import { ReactComponent as RefreshLogo } from '../icons/refresh-cw.svg';

class DeviceSelect extends Component {
  state = {
    dropdownOpen : false,
    availableDevices: []
  }

  componentDidMount() {
    this.getAvailableDevices();
  }

  getAvailableDevices = () => {
    fetch("/playback/devices", {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        this.setState({ availableDevices : data.devices });
      })
      .catch(err => console.log(err));
  }

  onToggle = () => {
    this.setState( { dropdownOpen : !this.state.dropdownOpen })
    this.getAvailableDevices();
  };

  render() { 
    return (
      <React.Fragment>
        <div className="center">
        <p>Play on</p>
        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <button className="button" onClick={this.onToggle} aria-haspopup="true" aria-controls="dropdown-menu">
              <span>{this.props.currentDevice === '' ? 'Select a Device' : this.props.currentDevice}</span>
              <span className="icon is-small">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
            <div className="dropdown-menu" id="dropdown-menu">
            { this.state.dropdownOpen == true ? 
              <div className="dropdown-content">
                {this.state.availableDevices.length === 0 
                  ? <div className="dropdown-item">No devices available</div>
                  : <div>
                    {this.state.availableDevices.map(device => 
                      <a className="dropdown-item"
                        onClick={(e) => { this.props.onDeviceSelect(e); this.onToggle(); }}
                        data-value={device.id} 
                        key={this.state.availableDevices.indexOf(device)}>
                        {device.name}
                      </a>
                    )}
                    </div>
                }
              </div>
            : <></>
          }
          </div>
        </div>
        </div>
      </React.Fragment>
    );
  }
}
 
export default DeviceSelect;