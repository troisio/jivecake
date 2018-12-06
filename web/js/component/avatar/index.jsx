import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './style.scss';

const EMPTY_IMAGE = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E';

export class Avatar extends React.Component {
  static propTypes = {
    styleName: PropTypes.string,
    className: PropTypes.string,
    src: PropTypes.string
  };

  static defaultProps = {
    className: '',
    src: EMPTY_IMAGE
  };

  render() {
    const props = _.omit(this.props, ['className', 'styleName', 'src']);
    let styleName = 'root'

    if (this.props.src === EMPTY_IMAGE) {
      styleName += ' empty';
    }

    return (
      <img className={this.props.className} styleName={styleName} src={this.props.src} { ...props } />
    );
  }
}
