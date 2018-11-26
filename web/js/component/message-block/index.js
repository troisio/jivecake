import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import './style.scss';

export class MessageBlockType {
  static success = 'success';
  static error = 'error';
  static warning = 'warning';
}

export class MessageBlock extends React.Component {
  static propTypes = {
    type: PropTypes.string
  };

  static defaultProps = {
    type: MessageBlockType.error
  };

  render() {
    const styleName = 'root ' + this.props.type;
    const props = _.omit(this.props, ['type']);

    return (
      <div styleName={styleName} { ...props }>
        {this.props.children}
      </div>
    );
  }
}
