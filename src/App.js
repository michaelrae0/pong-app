import React from 'react';
import './index.css';
import Paddle from './Paddle.js';
import Ball from './Ball.js';
import Score from './Score.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    // Used for setting state variable
    let clientWidth   = document.documentElement.clientWidth,
        clientHeight  = document.documentElement.clientHeight,
        viewWidth     = 840,
        viewHeight    = 600,
        viewLeft      = (clientWidth  - viewWidth) / 2,
        viewTop       = (clientHeight - viewHeight) / 2,

        paddleDims    = { height: 14, width: 1.5 },
        ballDims      = { height: 2, width: 2 },

        dR            = viewHeight / 100,
        maxX          = 140;
    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    //   viewWidth     = 336;
    //   viewHeight    = 240;
    //   viewLeft      = (clientWidth  - viewWidth) / 2;
    //   viewTop       = (clientHeight - viewHeight) / 2;
    //   dR            = viewHeight/100;
    //   this.state.paddleDims    = { height: 20, width: 3};
    //   ballDims      = { height: 3, width: 3};
    // }

    this.state = {
      // Player is the left paddle, Enemy is the right paddle
      playerLoc:    {x: 2, y: 50 - paddleDims.height/2}, 
      enemyLoc:     {x: maxX- paddleDims.width - 2, y: 50 - paddleDims.height/2},
      ballLoc:      { 
                      x: maxX/2 - ballDims.height/2, 
                      y: 50 - ballDims.width/2 
                    },

      playerV:      0,
      ballVel:      this.randomBallDir(115 - Math.random() * 65),

      score:        { playerS: 0, enemyS: 0 },
      lastHit:      "",
      wallHit:      "",
      isMouseDown:  false,
      selectedPlayer: "",
      // Screen/object dimensions
      viewWidth,
      viewHeight,
      maxX,
      viewLeft,
      viewTop,

      paddleDims,
      ballDims,
      dR
    }
  }
  randomBallDir = initDeg => {
    return {
      x: Math.sin(Math.PI/180 * initDeg) * 1.8,
      y: Math.cos(Math.PI/180 * initDeg) * 1.8,
    }
  }
  nextFrame = () => {
    let autoLocation = (relLoc, paddleStr, initPadLoc) => {
      let initX   = this.state.maxX * 0.5,  // Where v starts to change
          deltaV  = 0.8,        // maximum add to this.state.enemyLoc
          deltaX  = this.state.maxX - 100, // linear scale
          vo      = 0.7,
          paddleCenter = initPadLoc.y + this.state.paddleDims.height/2,
          ballCenter        = this.state.ballLoc.y + this.state.ballDims.height/2;


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
    let wallCollisionTest = nextY => {
      if (nextY < 0.5)  return 0.5;
      else if (nextY > 99.5 - this.state.paddleDims.height) return 99.5 - this.state.paddleDims.height;
      else return nextY;
    }
    let ballPaddleCollision = (paddleStr, initPadLoc) => {
      let deltaY        = this.state.paddleDims.height + this.state.ballDims.height,
          deltaDeg      = 120, // Ball can shoot at a max angle of 70 deg from either side
          offsetDeg     = (180 - deltaDeg) / 2 + 5, 

          ballCenter    = this.state.ballLoc.y + this.state.ballDims.height/2,
          collisionLoc  = ballCenter - initPadLoc.y + this.state.ballDims.height/2,                // Determines rebound angle
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
    let ballWallCollision = () => {    
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
    let ballNoCollision = () => {
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
    let newBall = () => {
      let nextBallLoc = {
        x: this.state.maxX/2 - this.state.ballDims.height/2,
        y: 50 - this.state.ballDims.width/2
      },
        initDeg = 140 - Math.random() * 60,
        nextBallVel = this.randomBallDir(initDeg);
      this.setState({
        ballVel: nextBallVel,
        ballLoc: nextBallLoc
      });
    }
    let newScore = () => {
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

    let paddleMovement = () => {
      // Paddles moves if not currently selected with the mouse. AI!
      let nextEnemyLoc = autoLocation(relEnemyLoc, "enemy", this.state.enemyLoc),
      nextPlayerLoc = autoLocation(relPlayerLoc, "player", this.state.playerLoc);
      // Paddle/wall collision with a little padding
      nextEnemyLoc.y = wallCollisionTest(nextEnemyLoc.y);
      nextPlayerLoc.y = wallCollisionTest(nextPlayerLoc.y);
      this.setState({
        playerLoc: nextPlayerLoc,
        enemyLoc: nextEnemyLoc,
      })
    }
    let ballMovement = () => {
      // Ball hits left or right wall (Score!)
      if (this.state.ballLoc.x <= 0 || this.state.ballLoc.x + this.state.ballDims.width >= 140) {
        newScore();
        newBall();
      }
      else if ( // Ball hits player
        this.state.lastHit !== "player" &&
        this.state.ballLoc.x <= this.state.playerLoc.x + this.state.paddleDims.width &&  // Ball left, paddle right
        this.state.ballLoc.x >= this.state.playerLoc.x - 1 &&                     // Ball left, paddle left
        this.state.ballLoc.y + this.state.ballDims.height >= this.state.playerLoc.y &&   // Ball bottom, paddle top
        this.state.ballLoc.y <= this.state.playerLoc.y + this.state.paddleDims.height    // Ball top, paddle bottom
      ) {
        ballPaddleCollision("player", this.state.playerLoc);
      } 
      else if ( // Ball hits enemy
        this.state.lastHit !== "enemy" &&
        this.state.ballLoc.x + this.state.ballDims.width >= this.state.enemyLoc.x &&     // Ball right, paddle left
        this.state.ballLoc.x <= this.state.enemyLoc.x + this.state.paddleDims.width + 1 &&   // Ball left, paddle right
        this.state.ballLoc.y + this.state.ballDims.height >= this.state.enemyLoc.y &&    // Ball bottom, paddle top
        this.state.ballLoc.y <= this.state.enemyLoc.y + this.state.paddleDims.height     // Ball top, paddle bottom
      ) {
        ballPaddleCollision("enemy", this.state.enemyLoc)
      }  // Ball hits top/bottom wall
      else if (
        (this.state.ballLoc.y <= 0 && this.state.wallHit !== "top") || 
        (this.state.ballLoc.y >= 100 - this.state.ballDims.height && this.state.wallHit !== "bottom")
        ) { 
        ballWallCollision();
      }
      else { // Ball hits nothing
        ballNoCollision();
      }
    } 

    const initX         = this.state.maxX * 0.5,                   // When the ball passes this, the balls become autonomous
          relEnemyLoc   = this.state.ballLoc.x - initX, // The relative locations of the balls from initx
          relPlayerLoc  = initX - this.state.ballLoc.x

    paddleMovement();
    ballMovement();

    this.setState({
      // Update for mouse calculations if screen changed size
      viewTop: (document.documentElement.clientHeight - this.state.viewHeight) / 2,
      viewLeft: (document.documentElement.clientWidth - this.state.viewWidth) / 2
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
      event.clientY >= this.state.viewTop + this.state.playerLoc.y * this.state.dR &&                                   // top
      event.clientY <= this.state.viewTop + (this.state.playerLoc.y + this.state.paddleDims.height) * this.state.dR &&  // bottom
      event.clientX >= this.state.viewLeft + (this.state.playerLoc.x - 2) * this.state.dR &&                            // left
      event.clientX <= this.state.viewLeft + (this.state.playerLoc.x + this.state.paddleDims.width + 2) * this.state.dR // right
    ) {
      this.setState({
        isMouseDown: true,
        selectedPlayer: "player"
      })
    }
    else if (
      event.clientY >= this.state.viewTop + this.state.enemyLoc.y * this.state.dR &&                                    // top
      event.clientY <= this.state.viewTop + (this.state.enemyLoc.y + this.state.paddleDims.height) * this.state.dR &&   // bottom
      event.clientX >= this.state.viewLeft + (this.state.enemyLoc.x - 2) * this.state.dR &&                             // left
      event.clientX <= this.state.viewLeft + (this.state.enemyLoc.x + this.state.paddleDims.width + 2) * this.state.dR  // right
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
  handleMouseMove = event => {
    if (this.state.isMouseDown === true) {
       if (this.state.selectedPlayer === "player") { 
        let paddleTopToMiddle = this.state.paddleDims.height / 2 * this.state.dR,
            click = event.clientY - paddleTopToMiddle,
            clickOnBoard = (click - this.state.viewTop) / this.state.dR
        // Stop wall collision
        if (clickOnBoard < 0.5) {
          clickOnBoard = 0.5;
        } else if (clickOnBoard > 99.5 - this.state.paddleDims.height) { 
          clickOnBoard = 99.5 - this.state.paddleDims.height;
        }
        this.setState({
          playerLoc: { 
            x: 2,
            y: clickOnBoard
          } 
        })
      }
    }
    if (this.state.selectedPlayer === "enemy") { 
      let paddleTopToMiddle = this.state.paddleDims.height / 2 * this.state.dR,
          click = event.clientY - paddleTopToMiddle,
          clickOnBoard = (click - this.state.viewTop) / this.state.dR
      // Stop wall collision
      if (clickOnBoard < 0.5) { 
        clickOnBoard = 0.5;
      } else if (clickOnBoard > 99.5 - this.state.paddleDims.height) { 
        clickOnBoard = 99.5 - this.state.paddleDims.height;
      }
      this.setState({
        enemyLoc: { 
          x: this.state.maxX- this.state.paddleDims.width - 2,
          y: clickOnBoard
        } 
      })
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
                        width: this.state.viewWidth,
                        height: this.state.viewHeight,
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
          value       ={this.state.ballLoc}
          itemprop    ={this.state.ballDims}
          index       ={this.state.dR}
        />
        <Paddle
          id          ="player"
          value       ={this.state.playerLoc}
          itemprop    ={this.state.paddleDims}
          index       ={this.state.dR}
          span        ={this.state.viewTop}
        />
        <Paddle 
          id          ="enemy"
          value       ={this.state.enemyLoc}
          itemprop    ={this.state.paddleDims}
          index       ={this.state.dR}
          span        ={this.state.viewTop}
        />
        <Score 
          value       ={this.state.score} 
          index       ={this.state.dR}
        />
      </div>
    );
  }
}

export default App;