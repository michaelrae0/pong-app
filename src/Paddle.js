import React from 'react';

class Paddle extends React.Component {
  render() {
    return (
      <div
      key={this.props.id}
      className="paddle"
      style={{
        top: this.props.value.y * this.props.index + 'px',
        left: this.props.value.x * this.props.index + 11 + 'px',
        width: this.props.itemprop.width * this.props.index + 'px',
        height: this.props.itemprop.height * this.props.index + 'px'
      }}
      >
      </div>
    )
  }
}

export default Paddle;