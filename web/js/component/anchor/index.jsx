import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import './style.scss';

export class Anchor extends React.Component {
  static propTypes = {
    to: PropTypes.string,
    styleName: PropTypes.string,
    className: PropTypes.string,
    button: PropTypes.bool
  }

  static defaultProps = {
    className: '',
    button: false
  }

  render() {
    const props = _.omit({ ...this.props }, ['to', 'styleName', 'button']);
    const styleName = this.props.button ? 'root button' : 'root';

    if (this.props.hasOwnProperty('to')) {
      return (
        <Link styleName={styleName} to={this.props.to} { ...props }>
          {this.props.children}
        </Link>
      )
    }

    return (
      <a styleName={styleName} { ...props }>
        {this.props.children}
      </a>
    );
  }
}
