import React from 'react';

class Paddles extends React.Component {

  
  render() {
    return (
      <div>
        {/* player */}
        <div
        key="0"
        className="paddle"
        style={{
          top: this.props.value.y * this.props.index + 'px',
          left: this.props.value.x * this.props.index + 11 + 'px',
          width: this.props.itemprop.width * this.props.index + 'px',
          height: this.props.itemprop.height * this.props.index + 'px'
        }}
        >
        </div>
        {/* enemy */}
        <div
        key="1"
        className="paddle"
        style={{
          top: this.props.span.y * this.props.index + 'px',
          left: this.props.span.x * this.props.index + 11 + 'px',
          width: this.props.itemprop.width * this.props.index + 'px',
          height: this.props.itemprop.height * this.props.index + 'px'
        }}
        >
        </div>
      </div>
    )
  }
}

export default Paddles;