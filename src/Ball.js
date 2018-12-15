import React from 'react';

class Ball extends React.Component {
  render() {
    return (
      <div
      key="2"
      className="ball"
      style={{
        left: this.props.value.x * this.props.index + 15 + 'px',
        top: this.props.value.y * this.props.index + 'px',
        width: this.props.itemprop.width * this.props.index + 'px',
        height: this.props.itemprop.height * this.props.index + 'px'
      }}
      >
      </div>
    )
  }
}

export default Ball;