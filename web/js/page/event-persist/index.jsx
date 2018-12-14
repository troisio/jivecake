import React from 'react';
import PropTypes from 'prop-types';

import { T } from 'common/i18n';
import { MAXIMUM_IMAGE_UPLOAD_BYTES } from 'common/schema';

import { MessageBlock } from 'component/message-block';
import { Input } from 'component/input';
import { Button } from 'component/button';
import { AvatarImageUpload } from 'component/avatar-image-upload';
import './style.scss';

export class EventPersist extends React.PureComponent {
  static propTypes = {
    event: PropTypes.object,
    organization: PropTypes.object,
    onPersisted: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      avatar: null,
      loading: false,
      file: null,
      displayUnableToPersistError: false,
      displayUnableToPersistAvatarError: false,
      avatarTooLarge: false
    };

    const { event } = this.props;

    if (event !== null) {
      this.state.name = event.name;
      this.state.avatar = event.avatar;
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    if (this.state.loading || this.state.avatarTooLarge) {
      return;
    }

    const { fetch, onPersisted, event } = this.props;

    this.setState({
      loading: true,
      displayUnableToPersistError: false,
      displayUnableToPersistAvatarError: false,
      avatarTooLarge: false
    });

    const url = event === null ? '/event' : `/event/${event._id}`;

    fetch(url, {
      method: 'POST',
      body: {
        name: this.state.name,
        email: this.state.email
      }
    }, {
      intercept: false
    }).then(({ response, body, intercept }) => {
      if (!response.ok) {
        this.setState({
          loading: false,
          displayUnableToPersistError: true
        });
        return;
      }

      if (this.state.file === null) {
        intercept();
        onPersisted(body);
        return;
      }

      const fileUpdatePromise = fetch(`/organization/${body._id}/avatar`, {
        method: 'POST',
        body: this.state.file
      });

      if (event === null) {
        intercept();
        onPersisted(body);
        return;
      }

      fileUpdatePromise.then(({ response }) => {
        if (response.status === 413) {
          this.setState({
            loading: false,
            avatarTooLarge: true
          });
        } else if (response.status === 200) {
          onPersisted();
        } else {
          this.setState({
            loading: false,
            displayUnableToPersistAvatarError: true
          });
        }
      }, () => {
        this.setState({
          loading: false,
          displayUnableToPersistAvatarError: true
        });
      });
    }, () => {
      this.setState({
        loading: false,
        displayUnableToPersistError: true
      });
    });
  }

  onEmailChange = (e) => {
    this.setState({ email: e.target.value });
  }

  onNameChange = (e) => {
    this.setState({ name: e.target.value });
  }

  onFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({
        avatar: reader.result,
        file,
        avatarTooLarge: file.size > MAXIMUM_IMAGE_UPLOAD_BYTES
      });
    };
    reader.readAsDataURL(file);
  }

  render() {
    const { event } = this.props;
    const submitText = event === null ? T('Create') : T('Update');

    let unableToPersistError = null;
    let unableToPersistAvatarError = null;
    let avatarTooLargeError = null;

    if (this.state.avatarTooLarge) {
      avatarTooLargeError = (
        <MessageBlock>
          {T('Sorry, your image is too large, please try a smaller image')}
        </MessageBlock>
      );
    }

    if (this.state.displayUnableToPersistAvatarError) {
      unableToPersistAvatarError = (
        <MessageBlock>
          {T('Sorry, we are not able to update your avatar, please try another image')}
        </MessageBlock>
      );
    }

    if (this.state.displayUnableToPersistError) {
      unableToPersistError = (
        <MessageBlock>
          {T('Sorry, we are not able save your data, please try again')}
        </MessageBlock>
      );
    }

    const avatarUploadProps = this.state.avatar === null ? {} : { src: this.state.avatar };

    return (
      <form onSubmit={this.onSubmit} styleName='root'>
        {unableToPersistAvatarError}
        {unableToPersistError}
        {avatarTooLargeError}
        <AvatarImageUpload styleName='avatar-image-upload' onFile={this.onFile} { ...avatarUploadProps } />
        <Input
          placeholder={T('Event Name')}
          onChange={this.onNameChange}
          value={this.state.name}
          required
        />
        <Button loading={this.state.loading}>
          {submitText}
        </Button>
      </form>
    );
  }
}
