import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Avatar } from 'component/avatar';
import './style.scss';

export class AvatarImageUpload extends React.Component {
  static propTypes = {
    styleName: PropTypes.string,
    className: PropTypes.string,
    onFile: PropTypes.func.isRequired,
    src: PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  input = React.createRef();

  onChange = (e) => {
    if (e.target.files.length === 1) {
      this.props.onFile(e.target.files[0]);
    }
  }

  onClick = () => {
    this.input.current.click();
  }

  render() {
    const props = _.omit(this.props, ['className', 'styleName', 'onFile']);
    const avatarProps = this.props.hasOwnProperty('src') ? { src: this.props.src } : {};

    return (
      <button className={this.props.className} type='button' onClick={this.onClick} styleName='root' { ...props }>
        <input onChange={this.onChange} ref={this.input} type='file' accept='image/*;capture=camera' styleName='input' />
        <Avatar { ...avatarProps } />
      </button>
    );
  }
}
