import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

import './style.scss';

export class Color {
  static main = 'main';
  static white = 'white';
}

export class Spinner extends React.Component {
  static propTypes = {
    color: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    color: Color.main
  };

  render() {
    const styleName = 'root ' + this.props.color;
    const props = _.omit(this.props, ['color', 'className']);
    return (
      <FontAwesomeIcon
        className={this.props.className}
        styleName={styleName}
        icon={faSyncAlt}
        { ...props }
      />
    );
  }
}

export class NaturalSpinner extends React.Component {
  render() {
    const props = _.omit(this.props, ['className']);
    return (
      <div styleName='root-natural-spinner' {...props}>
        <Spinner />
      </div>
    )
  }
}
