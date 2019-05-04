import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Avatar } from 'component/avatar';
import './style.scss';
import { EMPTY_IMAGE } from 'component/avatar';

export function AvatarImageUpload(props) {
  const input = React.createRef();

  function onChange(e) {
    if (e.target.files.length === 1) {
      props.onFile(e.target.files[0]);
    }
  }

  function onClick() {
    input.current.click();
  }

  const propsCopy = _.omit(props, ['className', 'id', 'styleName', 'onFile']);
  const avatarProps = props.hasOwnProperty('src') ? { src: props.src } : {};

  return (
    <button className={props.className} type='button' onClick={onClick} styleName='root' { ...propsCopy }>
      <input id={props.id} onChange={onChange} ref={input} type='file' accept='image/*;capture=camera' styleName='input' />
      <Avatar styleName='avatar' { ...avatarProps } />
    </button>
  );
}

AvatarImageUpload.propTypes = {
  id: PropTypes.string,
  styleName: PropTypes.string,
  className: PropTypes.string,
  onFile: PropTypes.func.isRequired,
  src: PropTypes.string,
  disabled: PropTypes.bool,
};

AvatarImageUpload.defaultProps = {
  id: '',
  src: EMPTY_IMAGE
};
