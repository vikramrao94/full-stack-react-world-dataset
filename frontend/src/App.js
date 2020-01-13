import React, { Component } from 'react';
import ReactNotifications from 'react-notifications-component';
import World from './components/World';
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <ReactNotifications />
        <World />
      </div>
    );
  }
}

export default App;
