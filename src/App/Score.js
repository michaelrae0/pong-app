import React from 'react';

class Score extends React.Component {
  render () {
    return (
      <div className="scoreboard" >
        <div
          key="score1"
          className="board-num"
          style={{
            left: 28 + '%',
            fontSize: 15 * this.props.dR
          }}
        >
          {this.props.count.playerS}
        </div>
        <div
          key="score2"
          className="board-num"
          style={{
            left: 65 + '%',
            fontSize: 15 * this.props.dR
          }}
        >
          {this.props.count.enemyS}
        </div>
      </div>
    )
  } 
}

export default Score;