import React from 'react';
import './index.css';
import Paddle from './Paddle.js';
import Ball from './Ball.js';
import Score from './Score.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    // To keep track of original dimensions
    this.viewWidth     = 840;
    this.viewHeight    = 600;

    this.paddleDims    = { height: 14, width: 1.5 };
    this.ballDims      = { height: 2, width: 2 };

    this.dR            = this.viewHeight / 100;
    this.maxX          = 140;
    this.maxY          = 100;
    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    //   viewWidth     = 336;
    //   viewHeight    = 240;
    //   viewLeft      = (clientWidth  - viewWidth) / 2;
    //   viewTop       = (clientHeight - viewHeight) / 2;
    //   dR            = viewHeight/100;
    //   this.paddleDims    = { height: 20, width: 3};
    //   ballDims      = { height: 3, width: 3};
    // }

    this.state = {
      // Player is the left paddle, Enemy is the right paddle
      playerLoc:    {x: 2, y: this.maxY/2 - this.paddleDims.height/2}, 
      enemyLoc:     {x: this.maxX - this.paddleDims.width - 2, y: this.maxY/2 - this.paddleDims.height/2},
      ballLoc:      { 
                      x: this.maxX/2 - this.ballDims.height/2, 
                      y: this.maxY/2 - this.ballDims.width/2 
                    },

      playerV:      0,
      ballVel:      this.randomBallDir(115 - Math.random() * 65),

      score:        { playerS: 0, enemyS: 0 },
      lastHit:      "",
      wallHit:      "",
      isMouseDown:  false,
      selectedPlayer: "",
      // Player dimensions
      viewTop: (document.documentElement.clientHeight - this.viewHeight) / 2,
      viewLeft: (document.documentElement.clientWidth - this.viewWidth) / 2
    }
  }
  autoLocation = (relLoc, paddleStr, initPadLoc) => {
    let initX   = this.maxX * 0.5,  // Where v starts to change
        deltaV  = 0.8,        // maximum add to this.state.enemyLoc
        deltaX  = this.maxX - 100, // linear scale
        vo      = 0.7,
        paddleCenter = initPadLoc.y + this.paddleDims.height/2,
        ballCenter   = this.state.ballLoc.y + this.ballDims.height/2;


    if (this.state.lastHit !== paddleStr && this.state.selectedPlayer !== paddleStr) {
      if (ballCenter - paddleCenter < -1) { // Ball above paddle
        if (paddleStr === "enemy" && this.state.ballLoc.x >= initX) {
          if (ballCenter - paddleCenter < -3) { // Speed up
            initPadLoc.y -= (relLoc) * (deltaV / deltaX) + vo;
          }
          else { // To prevent stuttering
            initPadLoc.y -= 0.4;
          }
        } else if (paddleStr === "player" && this.state.ballLoc.x <= initX) {
          if (ballCenter - paddleCenter < -3) { // Speed up
            initPadLoc.y -= (relLoc) * (deltaV / deltaX) + vo;
          }
          else { // To prevent stuttering
            initPadLoc.y -= 0.4;
          }
        }
      }
      else if (ballCenter - paddleCenter > 1) { // Ball below paddle
        if (paddleStr === "enemy" && this.state.ballLoc.x >= initX) {
          if (ballCenter - paddleCenter > 3) { // Speed up
            initPadLoc.y += (relLoc) * (deltaV / deltaX) + vo;
          }
          else { // To prevent stuttering
            initPadLoc.y += 0.4;
        }
        } else if (paddleStr === "player" && this.state.ballLoc.x <= initX) {
          if (ballCenter - paddleCenter > 3) { // Speed up
            initPadLoc.y += (relLoc) * (deltaV / deltaX) + vo;
          }
          else { // To prevent stuttering
            initPadLoc.y += 0.4;
          }
        }
      }
    }
    return initPadLoc;
  }
  paddleWallCollision = nextY => {
    if (nextY < 0.5)  return 0.5;
    else if (nextY > this.maxY - 0.5 - this.paddleDims.height) return this.maxY - 0.5 - this.paddleDims.height;
    else return nextY;
  }
  ballPaddleCollision = (paddleStr, initPadLoc) => {
    let deltaY        = this.paddleDims.height + this.ballDims.height,
        deltaDeg      = 120, // Ball can shoot at a max angle of 70 deg from either side
        offsetDeg     = (180 - deltaDeg) / 2 + 5, 

        ballCenter    = this.state.ballLoc.y + this.ballDims.height/2,
        collisionLoc  = ballCenter - initPadLoc.y + this.ballDims.height/2,                // Determines rebound angle
        reboundDeg    = collisionLoc * (deltaDeg / deltaY) + offsetDeg, // Measured clockwise
        reboundPI     = reboundDeg* Math.PI / 180,                      // radians
        totalSpeed    = 2.2,                                            // hypotenuse speed
        
        nextVX        = 0,
        nextVY        = 0;

    if (paddleStr === "enemy") {
      nextVX = -Math.sin(reboundPI) * totalSpeed;
    }
    else                        {
      nextVX = Math.sin(reboundPI) * totalSpeed;
    }
    // Add a little rng to stop the autobots from hitting it back and forth forever
    nextVY = -Math.cos(reboundPI) * totalSpeed + (Math.random() - 0.5);
    
    let newLoc = {
      x: this.state.ballLoc.x + nextVX,
      y: this.state.ballLoc.y + nextVY
    };
    this.setState({
      ballVel: { x: nextVX, y: nextVY },
      ballLoc: newLoc,
      lastHit: paddleStr,
      wallHit: ""
    })
  }
  ballWallCollision = () => {    
    let nextBallVel = {
      x: this.state.ballVel.x,
      y: -this.state.ballVel.y
    }
    let nextBallLoc = {
      x: this.state.ballLoc.x + this.state.ballVel.x,
      y: this.state.ballLoc.y + this.state.ballVel.y
    }
    this.setState({
      ballVel: nextBallVel,
      ballLoc: nextBallLoc
    })
    // Fixes a glitch where the ball hits a paddle and wall at the same time
    if (this.state.ballLoc.y <= 0) {
      this.setState({
        wallHit: "top"
      });
    } else {
      this.setState({
        wallHit: "bottom"
      })
    }
  }
  ballNoCollision = () => {
    let nextBallVel = {
      x: this.state.ballVel.x,
      y: this.state.ballVel.y
    }
    let nextBallLoc = {
      x: this.state.ballLoc.x + this.state.ballVel.x,
      y: this.state.ballLoc.y + this.state.ballVel.y
    }
    this.setState({
      ballVel: nextBallVel,
      ballLoc: nextBallLoc
    })
  }
  newBall = () => {
    let nextBallLoc = {
      x: this.maxX/2 - this.ballDims.height/2,
      y: this.maxY/2 - this.ballDims.width/2
    },
      initDeg = 140 - Math.random() * 60,
      nextBallVel = this.randomBallDir(initDeg);
    this.setState({
      ballVel: nextBallVel,
      ballLoc: nextBallLoc
    });
  }
  newScore = () => {
    let playerS = this.state.score.playerS,
        enemyS  = this.state.score.enemyS;
    if (this.state.ballLoc.x <= 0) {
      enemyS++;
    } else {
      playerS++
    }
    this.setState({
      lastHit: "",
      score: { playerS, enemyS }
    })
  }

  paddleMovement = () => {
    const initX       = this.maxX * 0.5,                   // When the ball passes this, the balls become autonomous
        relEnemyLoc   = this.state.ballLoc.x - initX, // The relative locations of the balls from initx
        relPlayerLoc  = initX - this.state.ballLoc.x;
    // Paddles moves if not currently selected with the mouse. AI!
    let nextEnemyLoc = this.autoLocation(relEnemyLoc, "enemy", this.state.enemyLoc),
        nextPlayerLoc = this.autoLocation(relPlayerLoc, "player", this.state.playerLoc);
    // Paddle/wall collision with a little padding
    nextEnemyLoc.y = this.paddleWallCollision(nextEnemyLoc.y);
    nextPlayerLoc.y = this.paddleWallCollision(nextPlayerLoc.y);
    this.setState({
      playerLoc: nextPlayerLoc,
      enemyLoc: nextEnemyLoc,
    })
  }
  ballMovement = () => {
    // Ball hits left or right wall (Score!)
    if (this.state.ballLoc.x <= 0 || this.state.ballLoc.x + this.ballDims.width >= this.maxX) {
      this.newScore();
      this.newBall();
    }
    else if ( // Ball hits player
      this.state.lastHit !== "player" &&
      this.state.ballLoc.x <= this.state.playerLoc.x + this.paddleDims.width &&  // Ball left, paddle right
      this.state.ballLoc.x >= this.state.playerLoc.x - 1 &&                     // Ball left, paddle left
      this.state.ballLoc.y + this.ballDims.height >= this.state.playerLoc.y &&   // Ball bottom, paddle top
      this.state.ballLoc.y <= this.state.playerLoc.y + this.paddleDims.height    // Ball top, paddle bottom
    ) {
      this.ballPaddleCollision("player", this.state.playerLoc);
    } 
    else if ( // Ball hits enemy
      this.state.lastHit !== "enemy" &&
      this.state.ballLoc.x + this.ballDims.width >= this.state.enemyLoc.x &&     // Ball right, paddle left
      this.state.ballLoc.x <= this.state.enemyLoc.x + this.paddleDims.width + 1 &&   // Ball left, paddle right
      this.state.ballLoc.y + this.ballDims.height >= this.state.enemyLoc.y &&    // Ball bottom, paddle top
      this.state.ballLoc.y <= this.state.enemyLoc.y + this.paddleDims.height     // Ball top, paddle bottom
    ) {
      this.ballPaddleCollision("enemy", this.state.enemyLoc)
    }  // Ball hits top/bottom wall
    else if (
      (this.state.ballLoc.y <= 0 && this.state.wallHit !== "top") || 
      (this.state.ballLoc.y >= this.maxY - this.ballDims.height && this.state.wallHit !== "bottom")
      ) { 
      this.ballWallCollision();
    }
    else { // Ball hits nothing
      this.ballNoCollision();
    }
  } 
  
  randomBallDir = initDeg => {
    return {
      x: Math.sin(Math.PI/180 * initDeg) * 1.8,
      y: Math.cos(Math.PI/180 * initDeg) * 1.8,
    }
  }

  nextFrame = () => {
    this.paddleMovement();
    this.ballMovement();

    this.setState({
      // Update for mouse calculations if screen changed size
      viewTop: (document.documentElement.clientHeight - this.viewHeight) / 2,
      viewLeft: (document.documentElement.clientWidth - this.viewWidth) / 2
    })
  }

  componentDidMount = () => {
    this.intervalId = setInterval(this.nextFrame, 1000/60);
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleMouseDown = event => {
    if (
      event.clientY >= this.state.viewTop + this.state.playerLoc.y * this.dR &&                                   // top
      event.clientY <= this.state.viewTop + (this.state.playerLoc.y + this.paddleDims.height) * this.dR &&  // bottom
      event.clientX >= this.state.viewLeft + (this.state.playerLoc.x - 2) * this.dR &&                            // left
      event.clientX <= this.state.viewLeft + (this.state.playerLoc.x + this.paddleDims.width + 2) * this.dR // right
    ) {
      this.setState({
        isMouseDown: true,
        selectedPlayer: "player"
      })
    }
    else if (
      event.clientY >= this.state.viewTop + this.state.enemyLoc.y * this.dR &&                                    // top
      event.clientY <= this.state.viewTop + (this.state.enemyLoc.y + this.paddleDims.height) * this.dR &&   // bottom
      event.clientX >= this.state.viewLeft + (this.state.enemyLoc.x - 2) * this.dR &&                             // left
      event.clientX <= this.state.viewLeft + (this.state.enemyLoc.x + this.paddleDims.width + 2) * this.dR  // right
    ) {
      this.setState({
        isMouseDown: true,
        selectedPlayer: "enemy"
      })
      
    }
  }
  handleMouseUp = event => {
    this.setState({
      isMouseDown: false,
      selectedPlayer: ""
    })
  }
  relClickPos = event => { 
    // Adjusts the location so the paddle is held in the middle
    let paddleTopToMiddle = this.paddleDims.height / 2 * this.dR,
        click = event.clientY - paddleTopToMiddle;
    return (click - this.state.viewTop) / this.dR
  }
  handleMouseMove = event => {
    if (this.state.isMouseDown === true) {
       if (this.state.selectedPlayer === "player") { 
        let clickOnBoard = this.relClickPos()
        // Stop wall collision
        this.paddleWallCollision(clickOnBoard);
        this.setState({
          playerLoc: { 
            x: 2,
            y: clickOnBoard
          } 
        });
        }
      }
      else if (this.state.selectedPlayer === "enemy") { 
        let clickOnBoard = this.relClickPos()
        // Stop wall collision
        this.paddleWallCollision(clickOnBoard)
        this.setState({
          enemyLoc: { 
            x: this.maxX- this.paddleDims.width - 2,
            y: clickOnBoard
          } 
        });
      }
    event.stopPropagation()
    event.preventDefault()
  }

  render() {
    return (
      <div
        className     ="viewport lock-screen"
        tabIndex      ="0"
        style         ={{
                        width: this.viewWidth,
                        height: this.viewHeight,
                        top: this.state.viewTop,
                        left: this.state.viewLeft
        }}
        onMouseDown   ={this.handleMouseDown}
        onMouseUp     ={this.handleMouseUp}
        onMouseMove   ={this.handleMouseMove}
        onTouchStart  ={this.handleMouseDown}
        onTouchEnd    ={this.handleMouseUp}
        onTouchMove   ={this.handleMouseMove}
      >
        <Ball
          loc   ={this.state.ballLoc}
          dims  ={this.ballDims}
          dR    ={this.dR}
        />
        <Paddle
          id    ="player"
          loc   ={this.state.playerLoc}
          dims  ={this.paddleDims}
          dR    ={this.dR}
          span  ={this.state.viewTop}
        />
        <Paddle 
          id    ="enemy"
          loc   ={this.state.enemyLoc}
          dims  ={this.paddleDims}
          dR    ={this.dR}
        />
        <Score 
          count ={this.state.score} 
          dR    ={this.dR}
        />
      </div>
    );
  }
}

export default App;