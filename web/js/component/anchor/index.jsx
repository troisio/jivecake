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
    button: PropTypes.bool,
    href: PropTypes.string,
    icon: PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    button: false,
    icon: false,
  }

  render() {
    const props = _.omit(this.props, ['to', 'className', 'styleName', 'button', 'icon']);
    let styleName = 'root';

    if (this.props.button) {
      styleName += ' button';
    }

    if (this.props.icon) {
      styleName += ' icon';
    }

    if (this.props.hasOwnProperty('to')) {
      return (
        <Link className={this.props.className} styleName={styleName} to={this.props.to} { ...props }>
          {this.props.children}
        </Link>
      )
    }

    return (
      <a className={this.props.className} styleName={styleName} { ...props }>
        {this.props.children}
      </a>
    );
  }
}
