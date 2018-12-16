import React from 'react';

class Paddle extends React.Component {
  render() {
    return (
      <div
      key={this.props.id}
      className="paddle"
      style={{
        top: this.props.loc.y * this.props.dR + 'px',
        left: this.props.loc.x * this.props.dR + 11 + 'px',
        width: this.props.dims.width * this.props.dR + 'px',
        height: this.props.dims.height * this.props.dR + 'px'
      }}
      >
      </div>
    )
  }
}

export default Paddle;