import React from 'react';

class Ball extends React.Component {
  render() {
    return (
      <div
      key="2"
      className="ball"
      style={{
        left: this.props.loc.x * this.props.dR + 15 + 'px',
        top: this.props.loc.y * this.props.dR + 'px',
        width: this.props.dims.width * this.props.dR + 'px',
        height: this.props.dims.height * this.props.dR + 'px'
      }}
      >
      </div>
    )
  }
}

export default Ball;