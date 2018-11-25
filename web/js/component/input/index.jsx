import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import './style.scss';

export class Input extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.bool,
    className: PropTypes.string,
    styleName: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    error: false
  };

  render() {
    const props = { ...this.props };
    const id = this.props.hasOwnProperty('id') ? this.props.id : _.random(0, 9007199254740991);
    const inputProps = { ..._.omit(this.props, ['label']), id };
    const inputStylename = this.props.error ? 'input error' : 'input';
    const input = <input styleName={inputStylename} className={inputProps.className} { ...inputProps } />;

    if (this.props.hasOwnProperty('label')) {
      return (
        <div>
          <label styleName='label' htmlFor={props.id}>
            {this.props.label}
          </label>
          {input}
        </div>
      )
    }

    return input;
  }
}
