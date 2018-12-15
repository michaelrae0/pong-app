import React from 'react';

class Paddle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paddleLoc: {
        x: this.props.value.x,
        y: this.props.value.y
      },
      isMouseDown: false
    }
  }

  handleMouseDown = event => {
    console.log('mousedown')
    this.setState({
      isMouseDown: true
    })
    event.stopPropagation()
    event.preventDefault()
  }
  handleMouseUp = event => {
    this.setState({
      isMouseDown: false
    })
    event.stopPropagation()
    event.preventDefault()
  }
  handleMouseMove = event => {
    
    if (this.state.isMouseDown === true) {
      console.log('mousemove')
      let clickOffset = event.pageY - this.state.paddleLoc.y + this.props.span;
      let nextY = event.pageY + clickOffset // + this.props.span;
      this.setState({
        paddleLoc: { x: 3, y: nextY / this.props.index }
      })
    }
    event.stopPropagation()
    event.preventDefault()
  }

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
      // onMouseDown ={this.handleMouseDown}
      // onMouseUp   ={this.handleMouseUp}
      // onMouseMove ={this.handleMouseMove}
      >
      </div>
    )
  }
}

export default Paddle;