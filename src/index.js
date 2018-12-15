import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Paddles from './Paddles.js';
import Ball from './Ball.js';
import Score from './Score.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    let viewWidth = 840,
    viewHeight    = 600,
    paddleDims    = { height: 16, width: 1.5 },
    ballDims      = { height: 2, width: 2 },
    dR            = viewHeight / 100;

    let initDeg   = 115 - Math.random() * 65,
        ballVel   = {
                    x: Math.sin(Math.PI/180 * initDeg) * 1.8,
                    y: Math.cos(Math.PI/180 * initDeg) * 1.8
        },
        maxX       = 140;

    this.state = {
      playerLoc:    {x: 2, y: 50 - paddleDims.height/2}, 
      enemyLoc:     {x: maxX- paddleDims.width - 2, y: 50 - paddleDims.height/2},
      ballLoc:      { 
                      x: maxX/2 - ballDims.height/2, 
                      y: 50 - ballDims.width/2 
                    },

      playerV:      0,
      ballVel,

      score:        { playerS: 0, enemyS: 0 },
      lastHit:      "",
      wallHit: "",
      isMouseDown:  false,
      // Screen/object dimensions
      viewWidth:    viewWidth,
      viewHeight:   viewHeight,
      maxX,

      paddleDims:   paddleDims,
      ballDims:     ballDims,
      dR:           dR
    }
  }

  nextFrame = () => {
    const maxX            = this.state.maxX,

          paddleDims      = this.state.paddleDims,
          ballDims        = this.state.ballDims;

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

        // For ball/paddle collision calcs
        deltaY            = paddleDims.height + ballDims.height,
        deltaDeg          = 90,
        offsetDeg         = (180 - deltaDeg) / 2 + 5

    // Enemy's center will move towards the ball's center
    let initX             = maxX * 0.4, // where velocity changes start
        deltaV            = 0.5,        // maximum add to initialEnemyLoc
        deltaX            = maxX - 100, // linear scale
        vo                = 0.8;

    // if (
    //   ballCenter - enemyCenter < -2 &&  // Enemy up if ball is above
    //   initialBallLoc.x < initX/2 &&
    //   this.state.lastHit !== "enemy")
    // { 
    //   nextEnemyLoc.y -= vo;
    // }
    // else if (
    //   ballCenter - enemyCenter > 2 && // Enemy down if ball is below
    //   initialBallLoc.x < initX/2 &&
    //   this.state.lastHit !== "enemy")
    // {
    //   nextEnemyLoc.y += vo;
    // }
    if (
      ballCenter - enemyCenter < -3  && // Enemy up fast if ball is above
      initialBallLoc.x >= initX &&
      this.state.lastHit !== "enemy")
    { 
      nextEnemyLoc.y -= (initialBallLoc.x - initX) * (deltaV / deltaX) + vo;
    }
    else if (
      ballCenter - enemyCenter > 3  && // Enemy down fast if ball is below
      initialBallLoc.x >= initX &&
      this.state.lastHit !== "enemy")
    { 
      nextEnemyLoc.y += (initialBallLoc.x - initX) * (deltaV / deltaX) + vo;
    } 

    // Paddle/wall collision test
    if (nextPlayerLoc.y < 0.5) {
      nextPlayerLoc.y = 0.5;
    } else if (nextPlayerLoc.y > 99.5 - paddleDims.height) { // Change
      nextPlayerLoc.y = 99.5 - paddleDims.height;
    }
    if (nextEnemyLoc.y < 0.5) {
      nextEnemyLoc.y = 0.5;
    } else if (nextEnemyLoc.y > 99.5 - paddleDims.height) {
      nextEnemyLoc.y = 99.5 - paddleDims.height;
    }

    // Ball collision test
    // Ball hits left or right wall (Score!)
    if (initialBallLoc.x <= 0 || initialBallLoc.x + ballDims.width >= 140) {
      nextBallLoc.x = 70 - ballDims.height/2; 
      nextBallLoc.y = 50 - ballDims.width/2;
      let initDeg = 120 - Math.random() * 60;
      nextBallVel = {
        x: Math.sin(Math.PI/180 * initDeg) * 1.8,
        y: Math.cos(Math.PI/180 * initDeg) * 1.8,
      }
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
      initialBallLoc.x >= initialPlayerLoc.x - 0.5 &&                     // Ball left, paddle left
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
        lastHit: "player",
        wallHit: ""
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
          lastHit: "enemy",
          wallHit: ""
        })
    }  // Ball hits top/bottom wall
    else if (
      initialBallLoc.y <= 0 && this.state.wallHit !== "top" || 
      initialBallLoc.y >= 100 - ballDims.height && this.state.wallHit !== "bottom"
      ) { 
      nextBallVel = {
        x: initialBallVel.x,
        y: -initialBallVel.y
      }
      nextBallLoc = {
        x: initialBallLoc.x + nextBallVel.x,
        y: initialBallLoc.y + nextBallVel.y
      };
      // Fixes a glitch where the ball hits a paddle and wall at the same time
      if (initialBallLoc.y <= 0) {
        this.setState({
          wallHit: "top"
        });
      } else {
        this.setState({
          wallHit: "bottom"
        })
      }
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
        top           = (clientHeight - this.state.viewHeight) / 2,
        left          = (clientWidth  - this.state.viewWidth) / 2;

    return (
      <div
        className     ="viewport"
        onKeyDown     ={this.handleKeyDown}
        onKeyUp       ={this.handleKeyUp}
        tabIndex      ="0"
        style         ={{
                        width: this.state.viewWidth,
                        height: this.state.viewHeight,
                        top,
                        left
                        }}
      >
        <Ball
          value       ={this.state.ballLoc}
          itemprop    ={this.state.ballDims}
          index       ={this.state.dR}
        />
        <Paddles
          value       ={this.state.playerLoc}
          span        ={this.state.enemyLoc}
          itemprop    ={this.state.paddleDims}
          index       ={this.state.dR}
          onmousedown ={this.handleMouseDown}
          onmouseup   ={this.handleMouseUp}
          onmousemove ={this.handleMouseMove}
        />
        <Score 
          value       ={this.state.score} 
          index       ={this.state.dR}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));