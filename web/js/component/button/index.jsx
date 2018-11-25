import React from 'react';

import './style.scss';

export class Button extends React.Component {
  render() {
    const props = { ...this.props };

    return (
      <button styleName='root' { ...props }>
        {this.props.children}
      </button>
    );
  }
}
