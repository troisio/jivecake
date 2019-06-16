import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spinner } from 'web/js/component/spinner';
import { Avatar } from 'web/js/component/avatar';
import './style.scss';
import { EMPTY_IMAGE } from 'web/js/component/avatar';

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

  const propsCopy = _.omit(props, ['className', 'id', 'styleName', 'onFile', 'loading']);
  const avatarProps = props.hasOwnProperty('src') ? { src: props.src } : {};
  const avatarOrLoading = props.loading ? <Spinner styleName='spinner' /> : <Avatar styleName='avatar' { ...avatarProps } />;

  return (
    <button className={props.className} type='button' onClick={onClick} styleName='root' { ...propsCopy }>
      <input disabled={props.disabled} id={props.id} onChange={onChange} ref={input} type='file' accept='image/*' styleName='input' />
      {avatarOrLoading}
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
  loading: PropTypes.bool
};

AvatarImageUpload.defaultProps = {
  id: '',
  src: EMPTY_IMAGE,
  disabled: false,
  loading: false
};
