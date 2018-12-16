import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';

class Index extends React.Component {

  render() {
    return (
      <div className="container">
        <App />
      </div> 
    )
  }
}

ReactDOM.render(<Index/>, document.getElementById('root'));
