import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Paddles from './Paddles.js';
import Ball from './Ball.js';
import Score from './Score.js';

let clientWidth   = document.documentElement.clientWidth,
    clientHeight   = document.documentElement.clientHeight,
    viewWidth     = 840,
    viewHeight    = 600,
    paddleDims    = { height: 20, width: 2 },
    ballDims      = { height: 3, width: 3 },
    dR            = viewHeight/100;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerLoc: {x: 3, y: 50 - paddleDims.height/2}, 
      enemyLoc: {x: 134, y: 50 - paddleDims.height/2},
      ballLoc: { 
        x: 70 - ballDims.height/2, 
        y: 50 - ballDims.width/2 
      },

      playerV: 0,
      ballVel: { x: -1.8, y: 0 },

      score: { playerS: 0, enemyS: 0 },
      lastHit: "",
      isMouseDown: false
    }
  }

  nextFrame = () => {
    let initialPlayerLoc  = this.state.playerLoc,
        nextPlayerLoc     = { x: initialPlayerLoc.x, y: initialPlayerLoc.y + this.state.playerV },

        initialEnemyLoc   = { x:this.state.enemyLoc.x, y:this.state.enemyLoc.y},
        nextEnemyLoc      = initialEnemyLoc, 

        initialBallLoc    = {x: this.state.ballLoc.x, y: this.state.ballLoc.y},
        nextBallLoc       = {x: 0, y: 0},
        initialBallVel    = {x: this.state.ballVel.x, y: this.state.ballVel.y},
        nextBallVel       = {x: initialBallVel.x, y: initialBallVel.y},

        ballCenter        = this.state.ballLoc.y + ballDims.height/2, 
        enemyCenter       = initialEnemyLoc.y + paddleDims.height/2,

        deltaY            = paddleDims.height + ballDims.height,
        deltaDeg          = 80,
        offsetDeg         = (180 - deltaDeg) / 2

    // Enemy's center will move towards the ball's center
    if (ballCenter - enemyCenter < -2) { // Enemy up if ball is above
      nextEnemyLoc.y -= 0.8;
    } else if (ballCenter - enemyCenter > 2) { // Enemy down if ball is below
      nextEnemyLoc.y += 0.8;
    } 

    // Paddle/wall collision test
    if (nextPlayerLoc.y < 0) {
      nextPlayerLoc.y = 0;
    } else if (nextPlayerLoc.y > 100 - paddleDims.height) { // Change
      nextPlayerLoc.y = 100 - paddleDims.height;
    }
    if (nextEnemyLoc.y < 0) {
      nextEnemyLoc.y = 0;
    } else if (nextEnemyLoc.y > 100 - paddleDims.height) {
      nextEnemyLoc.y = 100 - paddleDims.height;
    }

    // Ball collision test
    // Ball hits left or right wall (Score!)
    if (initialBallLoc.x <= 0 || initialBallLoc.x + ballDims.width >= 140) {
      nextBallLoc.x = 70 - ballDims.height/2; 
      nextBallLoc.y = 50 - ballDims.width/2;
      nextBallVel = { x: 1, y: 0 };
      let playerS = this.state.score.playerS,
          enemyS  = this.state.score.enemyS
      if (initialBallLoc.x <= 0) {
        enemyS++;
      } else {
        playerS++
      }
      this.setState({
        lastHit: "",
        score: { playerS, enemyS }
      })
    }
    else if ( // Ball hits player
      this.state.lastHit !== "player" &&
      initialBallLoc.x <= initialPlayerLoc.x + paddleDims.width &&  // Ball left, paddle right
      initialBallLoc.x >= initialPlayerLoc.x &&                     // Ball left, paddle left
      initialBallLoc.y + ballDims.height >= initialPlayerLoc.y &&   // Ball bottom, paddle top
      initialBallLoc.y <= initialPlayerLoc.y + paddleDims.height    // Ball top, paddle bottom
      ) {

      let collisionLoc = ballCenter - initialPlayerLoc.y;
      let reboundDeg = collisionLoc * (deltaDeg / deltaY) + offsetDeg;
      let reboundPI = reboundDeg* Math.PI / 180

      nextBallVel.x = Math.sin(reboundPI) * 1.8;
      nextBallVel.y = -Math.cos(reboundPI) * 1.8;
      nextBallLoc = {
        x: initialBallLoc.x + nextBallVel.x,
        y: initialBallLoc.y + nextBallVel.y
      };
      this.setState({
        lastHit: "player"
      })
    } 
    else if ( // Ball hits enemy
      this.state.lastHit !== "enemy" &&
      initialBallLoc.x + ballDims.width >= initialEnemyLoc.x &&     // Ball right, paddle left
      initialBallLoc.x <= initialEnemyLoc.x + paddleDims.width &&   // Ball left, paddle right
      initialBallLoc.y + ballDims.height >= initialEnemyLoc.y &&    // Ball bottom, paddle top
      initialBallLoc.y <= initialEnemyLoc.y + paddleDims.height     // Ball top, paddle bottom
      ) {
        let collisionLoc = ballCenter - initialEnemyLoc.y;
        let reboundDeg = collisionLoc * (deltaDeg / deltaY) + offsetDeg;
        let reboundPI = reboundDeg * Math.PI / 180
  
        nextBallVel.x = -Math.sin(reboundPI) * 1.8;
        nextBallVel.y = -Math.cos(reboundPI) * 1.8;
        nextBallLoc = {
          x: initialBallLoc.x + nextBallVel.x,
          y: initialBallLoc.y + nextBallVel.y
        };
        this.setState({
          lastHit: "enemy"
        })
    }  // Ball hits top/bottom wall
    else if (initialBallLoc.y <= 0 || initialBallLoc.y >= 100-ballDims.height) { 
      nextBallVel = {
        x: initialBallVel.x,
        y: -initialBallVel.y
      }
      nextBallLoc = {
        x: initialBallLoc.x + nextBallVel.x,
        y: initialBallLoc.y + nextBallVel.y
      };
    }
    else { // Ball hits nothing
      nextBallVel = initialBallVel;
      nextBallLoc = {
        x: initialBallLoc.x + nextBallVel.x,
        y: initialBallLoc.y + nextBallVel.y
      };
    }


    this.setState({
      playerLoc: nextPlayerLoc,
      enemyLoc: nextEnemyLoc,
      ballLoc: nextBallLoc,
      ballVel: nextBallVel
    })
  }

  componentDidMount = () => {
    this.intervalId = setInterval(this.nextFrame, 1000/60);
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleKeyDown = event => {
    if ((event.keyCode === 38) || (event.key === "w")) {
      this.setState({
        playerV: -1
      })
    } else if ((event.keyCode === 40) || (event.key === "s")) {
      this.setState({
        playerV: 1
      })
    }
  }
  handleKeyUp = event => {
    if ((event.keyCode === 38) || (event.key === "w")) {
      this.setState({
        playerV: 0
      })
    } else if ((event.keyCode === 40) || (event.key === "s")) {
      this.setState({
        playerV: 0
      })
    }
  }

  handleMouseDown = event => {
    this.setState({
      isMouseDown: true
    })
  }
  handleMouseUp = event => {
    this.setState({
      isMouseDown: false
    })
  }
  handleMouseMove = event => {
    if (this.state.isMouseDown === true) {
      let mouseY = event.clientY;
      this.setState({
        playerLoc: { x: 3, y: mouseY }
      })
    }
  }

  render() {
    let clientWidth   = document.documentElement.clientWidth,
        clientHeight  = document.documentElement.clientHeight,
        top           = (clientHeight - viewHeight) / 2,
        left          = (clientWidth  - viewWidth) / 2;

    return (
      <div
        className="viewport"
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        tabIndex="0"
        style={{
          width: viewWidth,
          height: viewHeight,
          top,
          left
        }}
      >
        <Ball
          value={this.state.ballLoc}
          itemprop={ballDims}
          index={dR}
        />
        <Paddles
          value={this.state.playerLoc}
          span={this.state.enemyLoc}
          itemprop={paddleDims}
          index={dR}
          onmousedown={this.handleMouseDown}
          onmouseup={this.handleMouseUp}
          onmousemove={this.handleMouseMove}
        />
        <Score 
          value={this.state.score} 
          index={dR}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));