import React from 'react';

class Score extends React.Component {
  render () {
    return (
      <div className="scoreboard" >
        <div
          key="score1"
          className="board-num one"
          style={{
            left: 35 * this.props.index - 21 + 'px'
          }}
        >
          {this.props.value.playerS}
        </div>
        <div
          key="score2"
          className="board-num two"
          style={{
            left: 105 * this.props.index - 21 + 'px'
          }}
        >
          {this.props.value.enemyS}
        </div>
      </div>
    )
  } 
}

export default Score;