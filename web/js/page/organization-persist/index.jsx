import React from 'react';
import PropTypes from 'prop-types';

import { T } from 'common/i18n';

import { MessageBlock } from 'component/message-block';
import { Input } from 'component/input';
import { Button } from 'component/button';
import { AvatarImageUpload } from 'component/avatar-image-upload';
import './style.scss';

export class OrganizationPersist extends React.Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    organizationId: PropTypes.string,
    organizations: PropTypes.object.isRequired,
    onOrganizationPersisted: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      avatar: null,
      loading: false,
      file: null,
      displayUnableToPersistError: false
    };

    if (props.hasOwnProperty('organizationId')) {
      if (props.organizations.hasOwnProperty(props.organizationId)) {
        const organization = props.organizations[props.organizationId];
        this.state.name = organization.name;
        this.state.email = organization.email;
        this.state.avatar = organization.avatar;
      } else {
        props.fetch('/organization/' + props.organizationId);
      }
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    if (this.state.loading) {
      return;
    }

    const { fetch } = this.props;

    this.setState({
      loading: true,
      displayUnableToPersistError: false
    });

    const url = this.props.hasOwnProperty('organizationId') ? '/organization/' + this.props.organizationId : '/organization';

    fetch(url, {
      method: 'POST',
      body: {
        name: this.state.name,
        email: this.state.email
      }
    }).then(({ response, body }) => {
      if (response.ok) {
        this.props.onOrganizationPersisted(body);

        fetch(`/user/${this.props.userId}/organization`, {
          query: {
            page: 0,
            lastUserActivity: -1
          }
        });

        if (this.state.file !== null) {
          fetch(`/organization/${body._id}/avatar`, {
            method: 'POST',
            body: this.state.file
          });
        }
      } else {
        this.setState({
          loading: false,
          displayUnableToPersistError: true
        });
      }
    }, () => {
      this.setState({
        loading: false,
        displayUnableToPersistError: true
      });
    })
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
      this.setState({ avatar: reader.result, file });
    };
    reader.readAsDataURL(file);
  }

  render() {
    const { organizations } = this.props;
    let organization = null;

    if (this.props.hasOwnProperty('organizationId')) {
      if (organizations.hasOwnProperty(this.props.organizationId)) {
        organization = organizations[this.props.organizationId];
      }
    }

    const submitText = organization === null ? T('Create') : T('Update');

    let unableToPersistError = null;

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
        {unableToPersistError}
        <AvatarImageUpload styleName='avatar-image-upload' onFile={this.onFile} { ...avatarUploadProps } />
        <Input
          placeholder={T('Organization Name')}
          onChange={this.onNameChange}
          value={this.state.name}
          required
        />
        <div styleName='email-section'>
          <Input
            placeholder={T('Email')}
            type='email'
            value={this.state.email}
            required
            onChange={this.onEmailChange}
          />
          <div styleName='email-note'>
            {T('This email will be used so your customers can contact you.')}
            &nbsp;
            {T('We will also use this email to send you organization specific communication.')}
          </div>
        </div>
        <Button loading={this.state.loading}>
          {submitText}
        </Button>
      </form>
    );
  }
}
