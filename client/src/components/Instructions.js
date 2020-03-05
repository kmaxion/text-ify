import React, { Component } from 'react';

const Instructions = ({ code }) => {
  return ( 
    <div className="card">
      <header class="card-header">
        <p class="card-header-title is-6 is-centered">
          Add a Song
        </p>
      </header>
      <div className="card-content container">
        <div className="content center">
          <div style={{"textAlign":"center"}}className="subtext">Send a text message to <strong>+1 (205) 395-0143</strong> containing your assigned code <strong>{code}</strong> followed by your song request:</div>
          <div className="chat">
            <div className="recipient">To: +1 (205) 395-0143</div>
            <div className="mine messages">
              <div className="message last">
                {code} <strong>[enter your song request]</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default Instructions;