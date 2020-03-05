import React, { Component } from 'react';

const Login = ({ checkStatus }) => {
  let onLogin = (e) => {
    const url = process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";
    const loginWindow = window.open(url + "/auth", 
      "Login to Spotify", 
      "height=600,width=450,toolbar=no,menubar=no,scrollbars=no,location=no,status=no"
      );

    let closeChecker = window.setInterval(() => {
      if (loginWindow.closed) {
          window.clearInterval(closeChecker);
          checkStatus();
      }
    }, 200);
  }

  return (
    <div class="card">
      <div id="login" class="card-content center">
        <p className="title">
          Textify
        </p>
        <p>Add to your Spotify playlist using phone texts!</p>
        <p>* Spotify Premium account required.</p>
      </div>
      <footer className="card-footer">
        <div className="card-footer-item">
          <button onClick={onLogin} className="button is-success is-rounded">Login with Spotify</button>
        </div>
      </footer>
    </div>


  );
}
 
export default Login;