import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ReactComponent as RefreshLogo } from '../icons/refresh-cw.svg';


class Info extends Component {
  state = {
    dropdownOpen : false,
    availableDevices: []
  }

  componentDidMount() {
    this.getAvailableDevices();
  }

  getAvailableDevices = () => {
    console.log("clicked");
    fetch("/playback/devices", {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({ availableDevices : data.devices });
      })
      .catch(err => console.log(err));
  }

  onToggle = () => this.setState( { dropdownOpen : !this.state.dropdownOpen });

  render() { 
    return (
      <React.Fragment>
        <p className="section-title" style={{margin: '5px'}}>play on</p>
        <div>
          <Dropdown isOpen={this.state.dropdownOpen} toggle={this.onToggle} size="sm">
            <DropdownToggle caret>
              {this.props.currentDevice === '' ? 'Select a Device' : this.props.currentDevice}
              </DropdownToggle>
            <DropdownMenu>
              {this.state.availableDevices.length === 0 
                ? <React.Fragment>
                    <DropdownItem disabled>No devices available</DropdownItem>
                  </React.Fragment>
                :
                  <React.Fragment>
                    {this.state.availableDevices.map(device => 
                      <DropdownItem onClick={this.props.onDeviceSelect} 
                        data-value={device.id} 
                        key={this.state.availableDevices.indexOf(device)}>
                        {device.name}
                      </DropdownItem>
                    )}
                  </React.Fragment>
              }
            </DropdownMenu>
          </Dropdown>
          <RefreshLogo className="list-hover grow pointer" style={{margin: '8px'}}  onClick={this.getAvailableDevices}/>
        </div>
        <p>Can't see your device? Click the refresh button above</p>
      </React.Fragment>
    );
  }
}
 
export default Info;