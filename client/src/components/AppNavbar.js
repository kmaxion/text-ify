import React, { Component } from 'react';

class AppNavbar extends Component {
  state = {
    navOpen: false
  }

  toggleNav = () => {
    this.setState({navOpen: !this.state.navOpen});
  }

  openGithub = () => {
    window.open("https://github.com/kmaxion/text-ify", "_blank");
  }

  onLogout = (e) => {
    fetch("/auth/logout", {credentials: 'include'})
    .then(res => res.json())
    .then(data => {
      if (data.logout) {
        console.log("logout success");
        this.props.checkStatus();
      }})
    .catch(err => console.log(err));
  }

  render() {
    return (
      <nav className="navbar" role="navigation">
        <div className="navbar-brand">
          <div className="navbar-item title is-4">
            Text-ify
          </div>
          <a role="button" onClick={this.toggleNav} className={`navbar-burger ${this.state.navOpen ? "is-active" : ""}`} aria-label="menu" aria-expanded="false">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className={`navbar-menu ${this.state.navOpen ? "is-active" : ""}`}>
          <div className="navbar-end">
            <div className="navbar-item">
            <button className="button is-small" onClick={this.openGithub}>
              <span className="icon"><i className="fab fa-github"></i></span>
              <span>GitHub</span>
            </button>
            </div>
            {this.props.status 
              ? <div className="navbar-item">
                <button className="is-danger is-small button" onClick={this.onLogout}><span>Logout</span></button> 
              </div>
              : <></>
            }
          </div>
        </div>
      </nav>
    );
  }
}
 
export default AppNavbar;