import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './style.scss';

const EMPTY_IMAGE = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E';

export function Avatar(props) {
  const propsCopy = _.omit(props, ['className', 'styleName', 'src']);
  let styleName = 'root';

  if (this.props.src === EMPTY_IMAGE) {
    styleName += ' empty';
  }

  return (
    <img className={props.className} styleName={styleName} src={props.src} { ...propsCopy } />
  );
}

Avatar.propTypes = {
  styleName: PropTypes.string,
  className: PropTypes.string,
  src: PropTypes.string
};

Avatar.defaultProps = {
  className: '',
  src: EMPTY_IMAGE
};
